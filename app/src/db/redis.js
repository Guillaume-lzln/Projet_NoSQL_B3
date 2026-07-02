// Connexion Redis — client unique, connecté au démarrage du serveur.
const { createClient } = require('redis');

const client = createClient({ url: process.env.REDIS_URL });

client.on('error', (err) => {
  console.error('[redis] erreur client :', err.message);
});

async function connect() {
  if (!client.isOpen) await client.connect();
  return client;
}

module.exports = { client, connect };
