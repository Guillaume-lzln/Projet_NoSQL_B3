// Catalogue produits — MongoDB (fiches riches) + Redis (cache, compteurs de vues).
const express = require('express');
const { getDb } = require('../db/mongo');
const redis = require('../db/redis');
const pool = require('../db/postgres');
const { asyncHandler } = require('./helpers');

const router = express.Router();

const CACHE_TTL_SECONDS = 600; // une fiche produit reste 10 min en cache

// Liste / recherche dans le catalogue (MongoDB).
// Exemples : /api/products?category=informatique
//            /api/products?q=café
router.get('/api/products', asyncHandler(async (req, res) => {
  const db = await getDb();
  const filter = {};
  if (req.query.category) filter.category = req.query.category;
  if (req.query.q) filter.$text = { $search: req.query.q };

  const products = await db.collection('products')
    .find(filter, { projection: {
      _id: 0, sku: 1, name: 1, brand: 1, category: 1, subcategory: 1,
      price: 1, tags: 1, ratingAverage: 1, ratingCount: 1,
    } })
    .sort({ price: 1 })
    .limit(50)
    .toArray();

  res.json({ count: products.length, products });
}));

// Fiche produit — stratégie cache-aside :
// 1. on tente Redis ; 2. sinon MongoDB, puis on remplit le cache (TTL 10 min).
// Chaque consultation incrémente aussi un compteur de vues dans Redis.
router.get('/api/products/:sku', asyncHandler(async (req, res) => {
  const { sku } = req.params;
  const cacheKey = `cache:product:${sku}`;

  const views = await redis.client.incr(`product:views:${sku}`);

  // Le stock et le vendeur viennent TOUJOURS de PostgreSQL (donnée vivante,
  // jamais mise en cache — contrairement à la fiche descriptive).
  const { rows } = await pool.query(
    `SELECT s.quantity AS stock, sel.name AS vendeur
       FROM products p
       JOIN stock s    ON s.product_id = p.id
       JOIN sellers sel ON sel.id = p.seller_id
      WHERE p.sku = $1`,
    [sku]
  );
  const live = rows[0] || { stock: null, vendeur: null };

  const cached = await redis.client.get(cacheKey);
  if (cached) {
    return res.json({ source: 'redis (cache)', vues: views, ...live, produit: JSON.parse(cached) });
  }

  const db = await getDb();
  const produit = await db.collection('products').findOne({ sku }, { projection: { _id: 0 } });
  if (!produit) return res.status(404).json({ erreur: `produit ${sku} introuvable` });

  await redis.client.set(cacheKey, JSON.stringify(produit), { EX: CACHE_TTL_SECONDS });
  res.json({ source: 'mongodb', vues: views, ...live, produit });
}));

// Avis clients d'un produit (sous-documents embarqués dans la fiche MongoDB).
router.get('/api/products/:sku/avis', asyncHandler(async (req, res) => {
  const db = await getDb();
  const doc = await db.collection('products').findOne(
    { sku: req.params.sku },
    { projection: { _id: 0, sku: 1, name: 1, reviews: 1 } }
  );
  if (!doc) return res.status(404).json({ erreur: 'produit introuvable' });
  res.json(doc);
}));

module.exports = router;
