// We always need to require express in every route file
const express = require('express');
// We create the express router
const router = express.Router();
// We require the database connection configuration
const connection = require('../db');
const passport = require('passport');

//http://localhost:5000/historic
router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const informClick = req.body;

    connection.query(
      'INSERT INTO historic SET ?',
      informClick,
      (err, results) => {
        if (err) {
          return res.status(500).json({
            error: err.message,
            sql: err.sql,
          });
        }
        return connection.query(
          'SELECT * FROM historic WHERE id = ?',
          results.insertId,
          (err2, records) => {
            if (err2) {
              return res.status(500).json({
                error: err2.message,
                sql: err2.sql,
              });
            }
            const inserted = records[0];
            return res.status(201).json(inserted);
          },
        );
      },
    );
  },
);

// router.post(
//   '/:idgasi/:button/:date',
//   passport.authenticate('jwt', { session: false }),
//   (req, resp) => {
//     const idgasi = req.params.idgasi;
//     const date = req.params.date;
//     const button = req.params.button;
//     const body = [idgasi, button, date];
//     console.log(body);
//     connection.query(
//       'INSERT INTO historic (idgasi, button, date) VALUES ?',
//       [body],
//       (err, result) => {
//         if (err) {
//           return resp.status(500).json({
//             error: err.message,
//             sql: err.sql,
//           });
//         } else {
//           return resp.status(201);
//         }
//       },
//     );
//   },
// );

module.exports = router;
