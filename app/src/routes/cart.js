// Panier — Redis (Hash + TTL). Un panier abandonné expire tout seul au bout de 48 h.
const express = require('express');
const redis = require('../db/redis');
const pool = require('../db/postgres');
const { asyncHandler } = require('./helpers');

const router = express.Router();

const CART_TTL_SECONDS = 48 * 3600;
const cartKey = (customerId) => `cart:${customerId}`;

// Contenu du panier, enrichi avec les prix de référence stockés dans PostgreSQL.
router.get('/api/cart/:customerId', asyncHandler(async (req, res) => {
  const key = cartKey(req.params.customerId);
  const [items, ttl] = await Promise.all([
    redis.client.hGetAll(key),
    redis.client.ttl(key),
  ]);

  const skus = Object.keys(items);
  if (skus.length === 0) return res.json({ panier: [], totalCents: 0, expireDansSecondes: null });

  const { rows } = await pool.query(
    'SELECT sku, name, price_cents FROM products WHERE sku = ANY($1)', [skus]
  );

  let totalCents = 0;
  const panier = rows.map((p) => {
    const quantite = parseInt(items[p.sku], 10);
    totalCents += quantite * p.price_cents;
    return { sku: p.sku, nom: p.name, quantite, prixUnitaireCents: p.price_cents };
  });

  res.json({ panier, totalCents, expireDansSecondes: ttl });
}));

// Ajout d'un article : HSET + remise à zéro du TTL du panier.
router.post('/api/cart/:customerId/items', asyncHandler(async (req, res) => {
  const { sku, quantite = 1 } = req.body || {};
  if (!sku) return res.status(400).json({ erreur: 'champ "sku" requis' });

  // Le produit doit exister dans le référentiel transactionnel.
  const { rows } = await pool.query('SELECT sku FROM products WHERE sku = $1 AND active', [sku]);
  if (rows.length === 0) return res.status(404).json({ erreur: `produit ${sku} introuvable` });

  const key = cartKey(req.params.customerId);
  const nouvelleQuantite = await redis.client.hIncrBy(key, sku, parseInt(quantite, 10));
  if (nouvelleQuantite <= 0) await redis.client.hDel(key, sku); // décrément sous zéro = retrait
  await redis.client.expire(key, CART_TTL_SECONDS);

  res.status(201).json({ ok: true, panier: await redis.client.hGetAll(key) });
}));

// Retrait d'un article du panier.
router.delete('/api/cart/:customerId/items/:sku', asyncHandler(async (req, res) => {
  const removed = await redis.client.hDel(cartKey(req.params.customerId), req.params.sku);
  res.json({ ok: removed > 0 });
}));

module.exports = router;
