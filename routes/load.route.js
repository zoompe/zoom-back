
// We always need to require express in every route file
const express = require('express');
// We create the express router 
const router = express.Router();
// We require the database connection configuration
const connection = require('../db');

 //test
 router.post('/', (req,resp) =>{
    const req_arr = Object.values(req.body).map((v) => Object.values(v));
     console.log(req_arr)
    // connection.query("INSERT INTO T_EFO (id_efo, DC_INDIVIDU_LOCAL , DC_STRUCTUREPRINCIPALEDE, DC_DERNIERAGENTREFERENT, DC_CIVILITE, DC_NOM, DC_PRENOM, DC_CATEGORIE, DC_SITUATIONDE, DC_PARCOURS, DC_TELEPHONE, DC_ADRESSEEMAIL, DC_LISTEROMEMETIERRECH, DC_LISTEROMEPROJETMETIER, DC_LISTEROMECREATREPRISE, DC_STATUTACTION_ID, DC_FORMACODE_ID, DC_LBLFORMACODE, DD_DATEPRECONISATION) VALUES ?", [req_arr], (err, result) => {
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