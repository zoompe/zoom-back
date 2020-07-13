// We always need to require express in every route file
const express = require('express');
// We create the express router
const router = express.Router();
// We require the database connection configuration
const connection = require('../db');
const passport = require('passport');

//count online users - navbar
//http://localhost:5000/count/onlineusers

router.get(
  '/onlineusers',
  passport.authenticate('jwt', { session: false }),
  (req, resp) => {
    let sql = 'SELECT COUNT(idgasi) as count FROM user WHERE isOnline=1';

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
//http://localhost:5000/count/showonlineusers

router.get(
  '/showonlineusers',
  passport.authenticate('jwt', { session: false }),
  (req, resp) => {
    let sql =
      'SELECT user.idgasi, user.name, fonction.fonction FROM user INNER JOIN fonction ON user.fonction_id = fonction.id_fonction WHERE user.isOnline =1';

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

module.exports = router;
