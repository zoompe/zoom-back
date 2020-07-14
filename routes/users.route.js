// We always need to require express in every route file
const express = require('express');
// We create the express router
const router = express.Router();
// We require the database connection configuration
const connection = require('../db');
const passport = require('passport');

//count online users - navbar
//http://localhost:5000/users/onlineusers

router.get(
  '/onlineusers',
  passport.authenticate('jwt', { session: false }),
  (req, resp) => {
    let sql = 'SELECT COUNT(idgasi) as count FROM User WHERE isOnline = 1';

    connection.query(sql, (err, results) => {
      if (err) {
        resp.status(500).send('Internal server error');
      } else {
        if (!results.length) {
          resp.status(404).send('datas not found');
        } else {
          resp.json(results);
        }
      }
    });
  },
);

//END

//show online users info - navbar
//http://localhost:5000/users/showonlineusers

router.get(
  '/showonlineusers',
  passport.authenticate('jwt', { session: false }),
  (req, resp) => {
    let sql =
      'SELECT idgasi, name, fonction FROM User INNER JOIN Fonction ON User.fonction_id = Fonction.id_fonction WHERE User.isOnline = 1';

    connection.query(sql, (err, results) => {
      if (err) {
        resp.status(500).send('Internal server error');
      } else {
        if (!results.length) {
          resp.status(404).send('datas not found');
        } else {
          resp.json(results);
        }
      }
    });
  },
);

//END


router.put('/connection/:idgasi',  (req, res) => {
  const idgasi = req.params.idgasi;
  // const formData = req.body;
  return connection.query('UPDATE User SET isOnline = 1 WHERE idgasi = ?', [ idgasi], (err) => {
    if (err) {
      return res.status(500).json({
        error: err.message,
        sql: err.sql,
      });
    }
    return connection.query('SELECT * FROM User WHERE idgasi = ?', idgasi, (err2, records) => {
      if (err2) {
        return res.status(500).json({
          error: err2.message,
          sql: err2.sql,
        });
      }
      const updatedUser = records[0];
      return res
        .status(200)
        .json(updatedUser);
    });
  });
},
);


router.post('/disconnection/:idgasi',  (req, res) => {
  const idgasi = req.params.idgasi;
  // const formData = req.body;
  return connection.query('UPDATE User SET isOnline = 0 WHERE idgasi = ?', [ idgasi], (err) => {
    if (err) {
      return res.status(500).json({
        error: err.message,
        sql: err.sql,
      });
    }
    return connection.query('SELECT idgasi, name, isOnline FROM User WHERE idgasi = ?', idgasi, (err2, records) => {
      if (err2) {
        return res.status(500).json({
          error: err2.message,
          sql: err2.sql,
        });
      }
      const updatedUser = records[0];
      return res
        .status(200)
        .json(updatedUser);
    });
  });
},
);

module.exports = router;
