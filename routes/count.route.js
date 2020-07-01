
// We always need to require express in every route file
const express = require('express');
// We create the express router 
const router = express.Router();
// We require the database connection configuration
const connection = require('../db');
const passport = require('passport');

 //count portefeuille
// passport.authenticate('jwt', { session:  false })
 router.get('/portefeuille', passport.authenticate('jwt', { session:  false }), (req,resp) =>{
    let fieldValue = ''

    let sql = 'SELECT COUNT(dc_individu_local) AS nb'
    sql += ' FROM T_Portefeuille INNER JOIN APE ON T_Portefeuille.dc_structureprincipalede = APE.id_ape'
    sql += ' WHERE dc_situationde = 2'

    //DR Admin
     //http://localhost:5000/count/portefeuille

    //Conseiller
     //http://localhost:5000/count/portefeuille?dc_dernieragentreferent=P000617 - XXXX
    if (req.query.dc_dernieragentreferent) {
        fieldValue = req.query.dc_dernieragentreferent;
        sql += ' AND dc_dernieragentreferent = ? '
      }
    //ELP
     //http://localhost:5000/count/portefeuille?dc_structureprincipalede=97801  
    if (req.query.dc_structureprincipalede) {
        fieldValue = req.query.dc_structureprincipalede;
        sql += ' AND dc_structureprincipalede = ? '
      }
      //DTNE-DTSO
     //http://localhost:5000/count/portefeuille?dt=DTNE  
    if (req.query.dt) {
        fieldValue = req.query.dt;
        sql += ' AND  dt = ? '
      }
   
    
    // console.log(fieldValue)
    connection.query(sql, [fieldValue], (err, results) => {
        if (err) {
            resp.status(500).send('Internal server error')
        } else {
            if (!results.length) {
                resp.status(404).send('datas not found')
            } else {
                // console.log(json(results))
                resp.json(results)
            }
        }
    })
})
//END

//count EFO
router.get('/efo', passport.authenticate('jwt', { session:  false }), (req,resp) =>{
    let fieldValue = ''

    let sql = 'SELECT COUNT(dc_individu_local) AS nb'
    sql += ' FROM T_EFO INNER JOIN APE ON T_EFO.dc_structureprincipalede= APE.id_ape'
   

    //DR Admin
     //http://localhost:5000/count/efo

    //Conseiller
     //http://localhost:5000/count/efo?dc_dernieragentreferent=P000617 - XXXX
    if (req.query.dc_dernieragentreferent) {
        fieldValue = req.query.dc_dernieragentreferent;
        sql += ' WHERE dc_dernieragentreferent = ? '
      }
    //ELP
     //http://localhost:5000/count/efo?dc_structureprincipalede=97801  
    if (req.query.dc_structureprincipalede) {
        fieldValue = req.query.dc_structureprincipalede;
        sql += ' WHERE dc_structureprincipalede = ? '
      }
      //DTNE-DTSO
     //http://localhost:5000/count/efo?dt=DTNE  
    if (req.query.dt) {
        fieldValue = req.query.dt;
        sql += ' AND dt = ? '
      }
   
    
    // console.log(fieldValue)
    connection.query(sql, [fieldValue], (err, results) => {
        if (err) {
            resp.status(500).send('Internal server error')
        } else {
            if (!results.length) {
                resp.status(404).send('datas not found')
            } else {
                resp.json(results)
            }
        }
    })
})
//END


module.exports = router;