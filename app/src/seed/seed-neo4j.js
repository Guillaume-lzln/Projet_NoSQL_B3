// Seed Neo4j : construit le graphe Clients / Produits / Catégories à partir
// des données de référence PostgreSQL (les achats du graphe sont les VRAIES
// commandes SQL) et ajoute des relations de navigation A_VU.
const neo = require('../db/neo4j');
const pool = require('../db/postgres');
const { mulberry32, randInt } = require('./rng');

async function seedNeo4j() {
  const rng = mulberry32(2025);

  // Idempotent : on repart d'un graphe vide.
  await neo.run('MATCH (n) DETACH DELETE n');

  await neo.run('CREATE CONSTRAINT produit_sku IF NOT EXISTS FOR (p:Produit) REQUIRE p.sku IS UNIQUE');
  await neo.run('CREATE CONSTRAINT client_id   IF NOT EXISTS FOR (c:Client)  REQUIRE c.id  IS UNIQUE');
  await neo.run('CREATE CONSTRAINT categorie   IF NOT EXISTS FOR (k:Categorie) REQUIRE k.nom IS UNIQUE');

  // ── Nœuds Produit + Catégorie (référentiel PostgreSQL).
  const { rows: produits } = await pool.query(
    'SELECT sku, name, category, price_cents FROM products'
  );
  await neo.run(
    `UNWIND $produits AS row
     MERGE (k:Categorie {nom: row.category})
     MERGE (p:Produit {sku: row.sku})
       SET p.name = row.name, p.prix_cents = row.price_cents
     MERGE (p)-[:APPARTIENT_A]->(k)`,
    { produits }
  );

  // ── Nœuds Client.
  const { rows: clients } = await pool.query(
    `SELECT id, first_name || ' ' || last_name AS name FROM customers`
  );
  await neo.run(
    `UNWIND $clients AS row
     MERGE (c:Client {id: row.id}) SET c.name = row.name`,
    { clients }
  );

  // ── Relations A_ACHETE : agrégat des vraies commandes SQL.
  const { rows: achats } = await pool.query(
    `SELECT o.customer_id AS "customerId", p.sku,
            SUM(oi.quantity)::int AS quantite,
            to_char(MAX(o.ordered_at), 'YYYY-MM-DD') AS derniere
       FROM orders o
       JOIN order_items oi ON oi.order_id = o.id
       JOIN products p     ON p.id = oi.product_id
      WHERE o.status <> 'annulee'
      GROUP BY o.customer_id, p.sku`
  );
  await neo.run(
    `UNWIND $achats AS row
     MATCH (c:Client {id: row.customerId})
     MATCH (p:Produit {sku: row.sku})
     MERGE (c)-[r:A_ACHETE]->(p)
       SET r.quantite = toInteger(row.quantite),
           r.derniere_commande = date(row.derniere)`,
    { achats }
  );

  // ── Relations A_VU : historique de navigation simulé (déterministe).
  const vues = [];
  for (const c of clients) {
    const nbProduitsVus = randInt(rng, 5, 14);
    const dejaVus = new Set();
    for (let i = 0; i < nbProduitsVus; i++) {
      const p = produits[randInt(rng, 0, produits.length - 1)];
      if (dejaVus.has(p.sku)) continue;
      dejaVus.add(p.sku);
      vues.push({ customerId: c.id, sku: p.sku, compteur: randInt(rng, 1, 8) });
    }
  }
  await neo.run(
    `UNWIND $vues AS row
     MATCH (c:Client {id: row.customerId})
     MATCH (p:Produit {sku: row.sku})
     MERGE (c)-[r:A_VU]->(p) SET r.vues = toInteger(row.compteur)`,
    { vues }
  );

  const [stats] = await neo.run(
    `MATCH (c:Client) WITH count(c) AS clients
     MATCH (p:Produit) WITH clients, count(p) AS produits
     MATCH ()-[r:A_ACHETE]->() WITH clients, produits, count(r) AS achats
     MATCH ()-[v:A_VU]->()
     RETURN clients, produits, achats, count(v) AS vues`
  );
  console.log(`[neo4j]  graphe : ${stats.clients} clients, ${stats.produits} produits, ` +
    `${stats.achats} relations A_ACHETE, ${stats.vues} relations A_VU`);
}

module.exports = seedNeo4j;
