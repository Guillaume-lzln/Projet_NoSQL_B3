// Commandes — écriture polyglotte :
//   PostgreSQL : transaction ACID (commande + lignes + stock + paiement)
//   Redis      : lecture puis suppression du panier, mise à jour du classement,
//                file d'attente d'e-mails de confirmation
//   Neo4j      : enrichissement du graphe d'achats (pour les recommandations)
const express = require('express');
const pool = require('../db/postgres');
const redis = require('../db/redis');
const neo = require('../db/neo4j');
const { asyncHandler } = require('./helpers');

const router = express.Router();

// Passage de commande à partir du panier Redis du client.
router.post('/api/orders/:customerId', asyncHandler(async (req, res) => {
  const customerId = parseInt(req.params.customerId, 10);
  const cartKey = `cart:${customerId}`;

  // 1. Redis : récupération du panier.
  const cart = await redis.client.hGetAll(cartKey);
  const skus = Object.keys(cart);
  if (skus.length === 0) return res.status(400).json({ erreur: 'panier vide ou expiré' });

  // 2. PostgreSQL : transaction ACID — tout passe ou rien ne passe.
  const client = await pool.connect();
  let orderId;
  let totalCents = 0;
  const lignes = [];
  try {
    await client.query('BEGIN');

    const addr = await client.query(
      `SELECT id FROM addresses WHERE customer_id = $1 AND type = 'livraison' LIMIT 1`,
      [customerId]
    );
    if (addr.rows.length === 0) throw new Error(`client ${customerId} sans adresse de livraison`);

    const order = await client.query(
      `INSERT INTO orders (customer_id, shipping_address_id, status)
       VALUES ($1, $2, 'payee') RETURNING id, ordered_at`,
      [customerId, addr.rows[0].id]
    );
    orderId = order.rows[0].id;

    for (const sku of skus) {
      const quantite = parseInt(cart[sku], 10);

      // Verrouillage de la ligne de stock (FOR UPDATE) : pas de survente
      // possible même avec des commandes simultanées.
      const prod = await client.query(
        `SELECT p.id, p.price_cents, s.quantity AS stock
           FROM products p JOIN stock s ON s.product_id = p.id
          WHERE p.sku = $1 FOR UPDATE OF s`,
        [sku]
      );
      if (prod.rows.length === 0) throw new Error(`produit ${sku} introuvable`);
      const { id: productId, price_cents, stock } = prod.rows[0];
      if (stock < quantite) throw new Error(`stock insuffisant pour ${sku} (reste ${stock})`);

      await client.query(
        'UPDATE stock SET quantity = quantity - $1, updated_at = now() WHERE product_id = $2',
        [quantite, productId]
      );
      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, unit_price_cents)
         VALUES ($1, $2, $3, $4)`,
        [orderId, productId, quantite, price_cents]
      );

      totalCents += quantite * price_cents;
      lignes.push({ sku, quantite, prixUnitaireCents: price_cents });
    }

    await client.query(
      `INSERT INTO payments (order_id, method, status, amount_cents, paid_at)
       VALUES ($1, 'carte', 'acceptee', $2, now())`,
      [orderId, totalCents]
    );

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    client.release();
    return res.status(409).json({ erreur: err.message });
  }
  client.release();

  // 3. Redis : le panier est consommé, le classement des ventes est mis à jour
  //    et un e-mail de confirmation est poussé dans la file d'attente.
  await redis.client.del(cartKey);
  for (const { sku, quantite } of lignes) {
    await redis.client.zIncrBy('ranking:bestsellers', quantite, sku);
  }
  await redis.client.lPush('queue:emails', JSON.stringify({
    type: 'confirmation_commande',
    orderId,
    customerId,
    totalCents,
    creeLe: new Date().toISOString(),
  }));

  // 4. Neo4j : le graphe d'achats alimente les recommandations.
  await neo.run(
    `MATCH (c:Client {id: $customerId})
     UNWIND $lignes AS ligne
     MATCH (p:Produit {sku: ligne.sku})
     MERGE (c)-[r:A_ACHETE]->(p)
     ON CREATE SET r.quantite = toInteger(ligne.quantite)
     ON MATCH  SET r.quantite = r.quantite + toInteger(ligne.quantite)
     SET r.derniere_commande = date()`,
    { customerId, lignes: lignes.map(({ sku, quantite }) => ({ sku, quantite })) }
  );

  res.status(201).json({ ok: true, commande: { id: orderId, totalCents, lignes } });
}));

// Détail d'une commande — jointures SQL (commande, client, lignes, paiement).
router.get('/api/orders/:orderId', asyncHandler(async (req, res) => {
  const { rows } = await pool.query(
    `SELECT o.id, o.status, o.ordered_at,
            c.first_name || ' ' || c.last_name AS client,
            json_agg(json_build_object(
              'sku', p.sku, 'produit', p.name,
              'quantite', oi.quantity, 'prixUnitaireCents', oi.unit_price_cents
            )) AS lignes,
            SUM(oi.quantity * oi.unit_price_cents)::int AS total_cents,
            pay.method AS paiement, pay.status AS statut_paiement
       FROM orders o
       JOIN customers c    ON c.id = o.customer_id
       JOIN order_items oi ON oi.order_id = o.id
       JOIN products p     ON p.id = oi.product_id
       LEFT JOIN payments pay ON pay.order_id = o.id
      WHERE o.id = $1
      GROUP BY o.id, c.first_name, c.last_name, pay.method, pay.status`,
    [req.params.orderId]
  );
  if (rows.length === 0) return res.status(404).json({ erreur: 'commande introuvable' });
  res.json(rows[0]);
}));

// Historique des commandes d'un client.
router.get('/api/customers/:id/orders', asyncHandler(async (req, res) => {
  const { rows } = await pool.query(
    `SELECT o.id, o.status, o.ordered_at,
            SUM(oi.quantity * oi.unit_price_cents)::int AS total_cents,
            COUNT(oi.product_id)::int AS nb_articles
       FROM orders o
       JOIN order_items oi ON oi.order_id = o.id
      WHERE o.customer_id = $1
      GROUP BY o.id
      ORDER BY o.ordered_at DESC`,
    [req.params.id]
  );
  res.json({ commandes: rows });
}));

module.exports = router;
