// Connexion Neo4j via le protocole Bolt.
const neo4j = require('neo4j-driver');

const driver = neo4j.driver(
  process.env.NEO4J_URL,
  neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
);

// Petit utilitaire : exécute une requête Cypher et renvoie les lignes
// sous forme d'objets JS simples (les entiers Neo4j sont convertis).
async function run(cypher, params = {}) {
  const { records } = await driver.executeQuery(cypher, params, { database: 'neo4j' });
  return records.map((r) => {
    const obj = {};
    for (const key of r.keys) {
      const value = r.get(key);
      obj[key] = neo4j.isInt(value) ? value.toNumber() : value;
    }
    return obj;
  });
}

module.exports = { driver, run };
