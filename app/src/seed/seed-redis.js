// Seed Redis : classement des ventes (Sorted Set) calculé depuis les
// commandes PostgreSQL, compteurs de vues, paniers avec TTL, sessions,
// ventes flash expirables et file d'attente d'e-mails.
const redis = require('../db/redis');
const pool = require('../db/postgres');
const { mulberry32, randInt } = require('./rng');

async function seedRedis() {
  const rng = mulberry32(1337);
  const client = await redis.connect();

  await client.flushDb(); // idempotent : la base Redis est dédiée au projet

  // ── Sorted Set : classement des meilleures ventes, dérivé des VRAIES
  //    commandes SQL (Redis sert de vue temps réel pré-calculée).
  const { rows: ventes } = await pool.query(
    `SELECT p.sku, SUM(oi.quantity)::int AS total
       FROM order_items oi
       JOIN orders o   ON o.id = oi.order_id
       JOIN products p ON p.id = oi.product_id
      WHERE o.status <> 'annulee'
      GROUP BY p.sku`
  );
  await client.zAdd('ranking:bestsellers', ventes.map((v) => ({ score: v.total, value: v.sku })));

  // ── Compteurs de vues par produit (String + INCR) : corrélés aux ventes
  //    pour rester réalistes (taux de conversion ~5 %).
  for (const v of ventes) {
    await client.set(`product:views:${v.sku}`, v.total * 17 + randInt(rng, 20, 400));
  }

  // ── Paniers en cours (Hash sku → quantité), expirent au bout de 48 h.
  const paniers = [
    { customerId: 3, items: { 'ELEC-0003': 1, 'LIVR-0002': 2 } },
    { customerId: 7, items: { 'JEUX-0001': 1, 'JEUX-0002': 1 } },
    { customerId: 12, items: { 'SPOR-0001': 1, 'SPOR-0004': 1, 'MODE-0001': 2 } },
    { customerId: 15, items: { 'MAIS-0003': 1 } },
    { customerId: 18, items: { 'INFO-0004': 1, 'INFO-0003': 1 } },
  ];
  for (const p of paniers) {
    const key = `cart:${p.customerId}`;
    await client.hSet(key, p.items);
    await client.expire(key, 48 * 3600);
  }

  // ── Sessions utilisateurs (Hash + TTL 30 min glissantes).
  const sessions = [
    { token: 'sess-a1b2c3d4', customerId: 3 },
    { token: 'sess-e5f6a7b8', customerId: 7 },
    { token: 'sess-c9d0e1f2', customerId: 15 },
  ];
  for (const s of sessions) {
    const key = `session:${s.token}`;
    await client.hSet(key, { customerId: s.customerId, connectedAt: new Date().toISOString() });
    await client.expire(key, 1800);
  }

  // ── Ventes flash : la clé disparaît toute seule à la fin de l'offre.
  await client.set('flashsale:ELEC-0003', JSON.stringify({ remisePct: 30 }), { EX: 6 * 3600 });
  await client.set('flashsale:JEUX-0003', JSON.stringify({ remisePct: 15 }), { EX: 2 * 3600 });

  // ── File d'attente d'e-mails (List) : un job en attente pour la démo.
  await client.lPush('queue:emails', JSON.stringify({
    type: 'relance_panier_abandonne',
    customerId: 12,
    creeLe: new Date().toISOString(),
  }));

  console.log(`[redis]  classement de ${ventes.length} produits, ${paniers.length} paniers (TTL 48 h), ` +
    `${sessions.length} sessions (TTL 30 min), 2 ventes flash, 1 job e-mail`);
}

module.exports = seedRedis;
