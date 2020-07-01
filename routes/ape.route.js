
const express = require('express');
const router = express.Router();
const connection = require('../db');

// GET - Retrieve all of the data from table ape
router.get('/', (req, res) => {
    connection.query('SELECT id_ape, libelle_ape FROM APE', (err, results) => {
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