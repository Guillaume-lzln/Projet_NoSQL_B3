// Connexion PostgreSQL — le driver `pg` lit PGHOST, PGUSER, PGPASSWORD,
// PGDATABASE et PGPORT directement dans les variables d'environnement.
const { Pool } = require('pg');

const pool = new Pool();

pool.on('error', (err) => {
  console.error('[postgres] erreur inattendue sur un client du pool :', err.message);
});

module.exports = pool;
