// Seed MongoDB : catalogue de fiches produits riches, avec avis clients
// embarqués (sous-documents) générés de façon déterministe.
const { getDb } = require('../db/mongo');
const productData = require('./data/products');
const { mulberry32, pick, randInt } = require('./rng');

const AUTEURS = [
  'Camille D.', 'Lucas M.', 'Léa B.', 'Hugo P.', 'Emma R.', 'Nathan R.',
  'Chloé D.', 'Louis G.', 'Manon M.', 'Jules L.', 'Inès S.', 'Gabriel M.',
  'Jade L.', 'Adam L.', 'Lina R.', 'Théo D.', 'Zoé B.', 'Raphaël M.',
  'Alice F.', 'Ethan G.', 'Sarah K.', 'Tom V.', 'Nina C.', 'Max B.',
];

const COMMENTAIRES = {
  5: ['Parfait, rien à redire !', 'Excellent produit, je recommande vivement.',
      'Conforme à la description, qualité au rendez-vous.', 'Très satisfait, livraison rapide en plus.'],
  4: ['Très bon produit malgré un petit défaut de finition.', 'Bon rapport qualité/prix.',
      'Fait le travail, je recommande.', 'Presque parfait, il manque juste un détail.'],
  3: ['Correct sans plus.', 'Moyen : ça fait le travail mais sans éclat.',
      'Conforme mais la qualité pourrait être meilleure.'],
  2: ['Déçu, je m’attendais à mieux pour ce prix.', 'Qualité en dessous de mes attentes.'],
  1: ['Produit défectueux à réception, je déconseille.', 'Très déçu, retour effectué.'],
};

function genererAvis(rng, produit) {
  const nbAvis = randInt(rng, 2, 9);
  const avis = [];
  for (let i = 0; i < nbAvis; i++) {
    // Note centrée sur la « qualité » du produit, bornée entre 1 et 5.
    const brut = Math.round(produit.quality + (rng() * 2 - 1) * 1.4);
    const rating = Math.max(1, Math.min(5, brut));
    const joursAvant = randInt(rng, 1, 180);
    avis.push({
      author: pick(rng, AUTEURS),
      rating,
      comment: pick(rng, COMMENTAIRES[rating]),
      date: new Date(Date.now() - joursAvant * 86400000),
      verified: rng() < 0.8, // achat vérifié
    });
  }
  return avis.sort((a, b) => b.date - a.date);
}

async function seedMongo() {
  const rng = mulberry32(42);
  const db = await getDb();
  const col = db.collection('products');

  await col.drop().catch(() => {}); // idempotent : on repart de zéro

  const docs = productData.map(({ quality, ...produit }) => {
    const reviews = genererAvis(rng, { quality });
    return {
      ...produit,
      images: [
        `https://img.marketplace.local/${produit.sku}/principale.jpg`,
        `https://img.marketplace.local/${produit.sku}/vue-2.jpg`,
      ],
      reviews,
      ratingAverage: Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 100) / 100,
      ratingCount: reviews.length,
      updatedAt: new Date(),
    };
  });

  await col.insertMany(docs);

  // Index orientés requêtes : accès par SKU, filtre catégorie + tri prix,
  // et recherche plein texte en français.
  await col.createIndex({ sku: 1 }, { unique: true });
  await col.createIndex({ category: 1, price: 1 });
  await col.createIndex(
    { name: 'text', description: 'text', tags: 'text' },
    { default_language: 'french' }
  );

  const nbAvis = docs.reduce((s, d) => s + d.reviews.length, 0);
  console.log(`[mongo]  ${docs.length} fiches produits insérées (${nbAvis} avis embarqués), 3 index créés`);
}

module.exports = seedMongo;
