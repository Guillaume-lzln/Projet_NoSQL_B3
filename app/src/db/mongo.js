// Connexion MongoDB — un seul client partagé pour toute l'application.
const { MongoClient } = require('mongodb');

const client = new MongoClient(process.env.MONGO_URL);
const dbName = process.env.MONGO_DB || 'marketplace';

let connected = false;

async function getDb() {
  if (!connected) {
    await client.connect();
    connected = true;
  }
  return client.db(dbName);
}

module.exports = { client, getDb };
