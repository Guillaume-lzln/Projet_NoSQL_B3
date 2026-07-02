const path = require('path');
const express = require('express');

const pool = require('./db/postgres');
const { getDb } = require('./db/mongo');
const redis = require('./db/redis');
const neo = require('./db/neo4j');

const app = express();
app.use(express.json());

// Interface web (front statique, non notée — support de démonstration).
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use(require('./routes/products'));
app.use(require('./routes/cart'));
app.use(require('./routes/orders'));
app.use(require('./routes/reco'));
app.use(require('./routes/stats'));
app.use(require('./routes/customers'));

// Vérifie que l'application est réellement connectée aux quatre bases.
app.get('/health', async (_req, res) => {
  const status = {};
  try {
    await pool.query('SELECT 1');
    status.postgres = 'ok';
  } catch (e) { status.postgres = `erreur : ${e.message}`; }
  try {
    await (await getDb()).command({ ping: 1 });
    status.mongodb = 'ok';
  } catch (e) { status.mongodb = `erreur : ${e.message}`; }
  try {
    await redis.client.ping();
    status.redis = 'ok';
  } catch (e) { status.redis = `erreur : ${e.message}`; }
  try {
    await neo.run('RETURN 1');
    status.neo4j = 'ok';
  } catch (e) { status.neo4j = `erreur : ${e.message}`; }

  const ok = Object.values(status).every((s) => s === 'ok');
  res.status(ok ? 200 : 503).json({ ok, bases: status });
});

// Gestion centralisée des erreurs des routes async.
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ erreur: err.message });
});

const PORT = process.env.PORT || 3000;

async function start() {
  await redis.connect();
  await getDb();
  app.listen(PORT, () => {
    console.log(`API marketplace démarrée sur http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Échec du démarrage :', err);
  process.exit(1);
});
