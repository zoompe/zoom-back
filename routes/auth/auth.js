const express = require('express');
const router = express.Router();
const connection = require('../../db');
const bcrypt=require('bcrypt');
const passport = require('passport');
const jwt = require('jsonwebtoken');

router.post('/signup', function(req, res, next) {
        
  const hash = bcrypt.hashSync(req.body.password, 10);
  const { idgasi, name, function_id, team_id, p_user, ape_id  } = req.body;
  const userValue= [idgasi, name, function_id, team_id, p_user, ape_id, hash ]
  
        // connection.query('INSERT INTO users SET ?', userData, (err, results) => {
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
 
      router.post('/signin', function(req, res, next) {
          passport.authenticate('local',(err, user, info) => { 
            if(err) return res.status(500).send(err) 
            if (!user) return res.status(400).json({message: info.message});   
            const token = jwt.sign(JSON.stringify(user), 'coucou');  
            return res.json({user, token}); 
        })(req, res);
      })
   
            
     
module.exports = router;