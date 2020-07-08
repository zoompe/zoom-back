
// We always need to require express in every route file
const express = require('express');
// We create the express router 
const router = express.Router();
// We require the database connection configuration
const connection = require('../db');
const passport = require('passport');

 //test load admin
 router.post('/', passport.authenticate('jwt', { session:  false }), (req,resp) =>{
    const req_arr = Object.values(req.body).map((v) => Object.values(v));
    //  console.log(req_arr)
    // connection.query("INSERT INTO T_EFO (id_efo, dc_individu_local , dc_structureprincipalede, dc_dernieragentreferent, dc_civilite, dc_nom, dc_prenom, dc_categorie, dc_situationde, dc_parcours, dc_telephone, dc_adresseemail, dc_listeromemetierrech, dc_listeromeprojetmetier, dc_listeromecreatreprise, dc_statutaction_id, dc_formacode_id, dc_lblformacode, dd_datepreconisation) VALUES ?", [req_arr], (err, result) => {
    connection.query("INSERT INTO test (id, level , cvss, title, vulnerability, solution, reference) VALUES ?", [req_arr], (err, result) => {
      if (err) {
        return resp.status(500).json({
          error: err.message,
          sql: err.sql,
        });
      }
      else {
        return resp
        .status(201)
        .json(req_arr.length);
      }
    
    })})

module.exports = router;