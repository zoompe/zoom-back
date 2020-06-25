
const express = require('express');
const router = express.Router();
const connection = require('../db');

// GET - Retrieve all of the dc_dernieragentreferent from table T_Portefeuille
router.get('/', (req, res) => {
    connection.query('SELECT DISTINCT dc_dernieragentreferent FROM T_Portefeuille', (err, results) => {
      if (err) {
        res.status(500).json({
          error: err.message,
          sql: err.sql,
        });
      } else {
        res.json(results);
      }
    });
  });
    

module.exports = router;