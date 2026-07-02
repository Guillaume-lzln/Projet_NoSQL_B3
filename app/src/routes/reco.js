// Recommandations — Neo4j : parcours du graphe d'achats et de navigation.
const express = require('express');
const neo = require('../db/neo4j');
const { asyncHandler } = require('./helpers');

const router = express.Router();

// « Les clients ayant acheté ce produit ont aussi acheté… » (co-achat).
router.get('/api/products/:sku/reco', asyncHandler(async (req, res) => {
  const rows = await neo.run(
    `MATCH (p:Produit {sku: $sku})<-[:A_ACHETE]-(c:Client)-[:A_ACHETE]->(reco:Produit)
     WHERE reco.sku <> $sku
     RETURN reco.sku AS sku, reco.name AS nom, count(DISTINCT c) AS score
     ORDER BY score DESC
     LIMIT 5`,
    { sku: req.params.sku }
  );
  res.json({ base: 'neo4j', recommandations: rows });
}));

// Recommandations personnalisées : produits achetés par les clients qui ont
// les mêmes goûts que moi, et que je ne possède pas encore (2 sauts de graphe).
router.get('/api/customers/:id/recommendations', asyncHandler(async (req, res) => {
  const rows = await neo.run(
    `MATCH (moi:Client {id: $id})-[:A_ACHETE]->(:Produit)<-[:A_ACHETE]-(autre:Client)
           -[:A_ACHETE]->(reco:Produit)
     WHERE NOT (moi)-[:A_ACHETE]->(reco)
     RETURN reco.sku AS sku, reco.name AS nom,
            count(DISTINCT autre) AS clients_en_commun
     ORDER BY clients_en_commun DESC
     LIMIT 5`,
    { id: parseInt(req.params.id, 10) }
  );
  res.json({ base: 'neo4j', recommandations: rows });
}));

// Produits d'une catégorie les plus consultés par les acheteurs du produit donné :
// vitrine « découverte » mêlant relations A_VU et APPARTIENT_A.
router.get('/api/products/:sku/aussi-consultes', asyncHandler(async (req, res) => {
  const rows = await neo.run(
    `MATCH (p:Produit {sku: $sku})<-[:A_ACHETE|A_VU]-(c:Client)-[v:A_VU]->(autre:Produit)
     WHERE autre.sku <> $sku
     RETURN autre.sku AS sku, autre.name AS nom, sum(v.vues) AS vues
     ORDER BY vues DESC
     LIMIT 5`,
    { sku: req.params.sku }
  );
  res.json({ base: 'neo4j', produits: rows });
}));

module.exports = router;
