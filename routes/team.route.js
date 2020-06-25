
const express = require('express');
const router = express.Router();
const connection = require('../db');

// GET - Retrieve all of the data from table team
router.get('/', (req, res) => {
    connection.query('SELECT * FROM Team', (err, results) => {
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