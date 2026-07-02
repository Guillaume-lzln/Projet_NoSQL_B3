// Clients — lecture du référentiel PostgreSQL (utilisé par le sélecteur
// de compte du front en mode démo).
const express = require('express');
const pool = require('../db/postgres');
const { asyncHandler } = require('./helpers');

const router = express.Router();

router.get('/api/customers', asyncHandler(async (_req, res) => {
  const { rows } = await pool.query(
    'SELECT id, first_name, last_name FROM customers ORDER BY id'
  );
  res.json({ clients: rows });
}));

router.get('/api/customers/:id', asyncHandler(async (req, res) => {
  const { rows } = await pool.query(
    `SELECT c.id, c.first_name, c.last_name, c.email, a.city
       FROM customers c
       LEFT JOIN addresses a ON a.customer_id = c.id AND a.type = 'livraison'
      WHERE c.id = $1`,
    [req.params.id]
  );
  if (rows.length === 0) return res.status(404).json({ erreur: 'client introuvable' });
  res.json(rows[0]);
}));

module.exports = router;
