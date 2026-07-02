// Statistiques et temps réel — chaque route illustre la force d'une base.
const express = require('express');
const pool = require('../db/postgres');
const { getDb } = require('../db/mongo');
const redis = require('../db/redis');
const { asyncHandler } = require('./helpers');

const router = express.Router();

// Top 10 des meilleures ventes — Sorted Set Redis (temps réel, O(log n)).
router.get('/api/stats/bestsellers', asyncHandler(async (_req, res) => {
  const top = await redis.client.zRangeWithScores('ranking:bestsellers', 0, 9, { REV: true });
  if (top.length === 0) return res.json({ base: 'redis', top: [] });

  // Enrichissement des noms depuis le référentiel PostgreSQL.
  const { rows } = await pool.query(
    'SELECT sku, name FROM products WHERE sku = ANY($1)',
    [top.map((t) => t.value)]
  );
  const noms = Object.fromEntries(rows.map((r) => [r.sku, r.name]));
  res.json({
    base: 'redis (sorted set) + postgres (noms)',
    top: top.map((t, i) => ({ rang: i + 1, sku: t.value, nom: noms[t.value], ventes: t.score })),
  });
}));

// Chiffre d'affaires par mois — agrégation SQL avec jointures.
router.get('/api/stats/revenue', asyncHandler(async (_req, res) => {
  const { rows } = await pool.query(
    `SELECT to_char(date_trunc('month', o.ordered_at), 'YYYY-MM') AS mois,
            COUNT(DISTINCT o.id)::int                             AS commandes,
            SUM(oi.quantity * oi.unit_price_cents)::bigint        AS ca_cents
       FROM orders o
       JOIN order_items oi ON oi.order_id = o.id
      WHERE o.status IN ('payee', 'expediee', 'livree')
      GROUP BY 1
      ORDER BY 1`
  );
  res.json({ base: 'postgresql', chiffre_affaires: rows });
}));

// Note moyenne et volume d'avis par catégorie — pipeline d'agrégation MongoDB.
router.get('/api/stats/ratings', asyncHandler(async (_req, res) => {
  const db = await getDb();
  const rows = await db.collection('products').aggregate([
    { $unwind: '$reviews' },
    { $group: {
        _id: '$category',
        note_moyenne: { $avg: '$reviews.rating' },
        nb_avis: { $sum: 1 },
    } },
    { $project: { _id: 0, categorie: '$_id', note_moyenne: { $round: ['$note_moyenne', 2] }, nb_avis: 1 } },
    { $sort: { note_moyenne: -1 } },
  ]).toArray();
  res.json({ base: 'mongodb (aggregation pipeline)', notes: rows });
}));

// Ventes flash en cours — clés Redis à durée de vie limitée (TTL).
router.get('/api/flash-sales', asyncHandler(async (_req, res) => {
  const keys = await redis.client.keys('flashsale:*');
  const ventes = [];
  for (const key of keys) {
    const [value, ttl] = await Promise.all([redis.client.get(key), redis.client.ttl(key)]);
    ventes.push({ sku: key.replace('flashsale:', ''), ...JSON.parse(value), finitDansSecondes: ttl });
  }
  res.json({ base: 'redis (TTL)', ventes_flash: ventes });
}));

// File d'attente des e-mails à envoyer (List Redis) — consultation sans dépiler.
router.get('/api/queue/emails', asyncHandler(async (_req, res) => {
  const jobs = await redis.client.lRange('queue:emails', 0, 9);
  res.json({ base: 'redis (list)', en_attente: jobs.map((j) => JSON.parse(j)) });
}));

module.exports = router;
