// Point d'entrée du seed : PostgreSQL est peuplé automatiquement par les
// scripts de seed/sql/ au premier démarrage du conteneur ; ce script
// vérifie son contenu puis peuple MongoDB, Redis et Neo4j.
// Lancement : docker compose run --rm seed
const pool = require('../db/postgres');
const { client: mongoClient } = require('../db/mongo');
const redis = require('../db/redis');
const { driver } = require('../db/neo4j');

const seedMongo = require('./seed-mongo');
const seedRedis = require('./seed-redis');
const seedNeo4j = require('./seed-neo4j');

async function main() {
  console.log('── Seed du marketplace polyglotte ──────────────────────────');

  // 1. PostgreSQL : vérification du peuplement initial.
  const { rows } = await pool.query(
    `SELECT (SELECT count(*) FROM customers)   AS clients,
            (SELECT count(*) FROM products)    AS produits,
            (SELECT count(*) FROM orders)      AS commandes,
            (SELECT count(*) FROM order_items) AS lignes,
            (SELECT count(*) FROM invoices)    AS factures`
  );
  const pg = rows[0];
  console.log(`[postgres] déjà peuplé au premier démarrage : ${pg.clients} clients, ` +
    `${pg.produits} produits, ${pg.commandes} commandes (${pg.lignes} lignes), ${pg.factures} factures`);
  if (parseInt(pg.commandes, 10) === 0) {
    throw new Error(
      'PostgreSQL est vide : supprimez le volume (docker compose down -v) puis relancez pour rejouer seed/sql/'
    );
  }

  // 2, 3, 4. Les trois bases NoSQL (Mongo d'abord, puis Redis et Neo4j
  // qui se nourrissent des données SQL).
  await seedMongo();
  await seedRedis();
  await seedNeo4j();

  console.log('── Seed terminé : les quatre bases sont peuplées ✔ ─────────');
}

main()
  .then(() => Promise.all([pool.end(), mongoClient.close(), redis.client.quit(), driver.close()]))
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Échec du seed :', err.message);
    process.exit(1);
  });
