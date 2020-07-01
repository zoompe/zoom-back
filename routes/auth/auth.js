const express = require('express');
const router = express.Router();
const connection = require('../../db');
const bcrypt=require('bcrypt');
const passport = require('passport');
const jwt = require('jsonwebtoken');

//signup new user
router.post('/signup', function(req, res, next) {
        
  const hash = bcrypt.hashSync(req.body.password, 10);
  const { idgasi, name, function_id, team_id, p_user, ape_id  } = req.body;
  const userValue= [idgasi, name, function_id, team_id, p_user, ape_id, hash ]
  
        connection.query('INSERT INTO User (idgasi, name, function_id, team_id, p_user, ape_id, password) VALUES (?, ?, ?, ?, ?, ?, ?)', userValue, (err, results) => {
            if (err) {
                return res.status(500).json({
                  flash: err.message,
                  sql: err.sql,
                });
              }
                return res
                  .status(201)
                  .json({ flash:  `User has been signed up !` });
              });
            });

  //login
      router.post('/signin', function(req, res, next) {
        passport.authenticate('local',(err, user, info) => { 
          if (err) {
            return res.status(500).json({
              flash: err.message,
              sql: err.sql,
            });
          }
          if (!user) return res.status(400).json({flash: info.message});  
         req.user = user
          const token = jwt.sign(JSON.stringify(user), 'coucou');  
          return res.json({user, token, flash:  `User sign in!` }); 
      })(req, res);
    })

//profile
    // router.get('/profile/:idgasi', passport.authenticate('jwt', { session:  false }), (req, res) => {
    //   const idgasiUser = req.params.idgasi;
    //   let sql= 'SELECT idgasi , Name, Fonction, Function_id, Team, Team_id, P_User, Libelle_APE, APE_id ' 
    //   sql += 'from User INNER JOIN Fonction ON User.Function_id = Fonction.id_Fonction '
    //   sql += 'LEFT JOIN Team ON User.Team_id = Team.id_Team '
    //   sql += 'LEFT JOIN APE ON User.APE_id = APE.id_APE '
    //   sql += 'WHERE idgasi = ?'
    //   connection.query(sql, [idgasiUser], (err, results) => {
    //     if (err) {
    //       return res.status(500).send(`An error occurred: ${err.message}`);
    //     }
    //     if (results.length === 0) {
    //       return res.status(404).send('user not found');
    //     }

    //     return res.json(results[0]);
    //   });
    // }); 
    router.get('/profile', passport.authenticate('jwt', { session:  false }),function (req, res) {
      res.send(req.user);
      })

//update user 
router.put('/profile/:idgasi',passport.authenticate('jwt', { session:  false }), (req, res) => {
  const idgasi = req.params.idgasi;
  return connection.query('UPDATE User SET function_id = ? , team_id = ? , p_user = ? , ape_id = ? WHERE idgasi = ?', [req.body.function_id , req.body.team_id , req.body.p_user , req.body.ape_id , idgasi], (err) => {
    // console.log(query)
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
      

module.exports = router;