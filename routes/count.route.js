
// We always need to require express in every route file
const express = require('express');
// We create the express router 
const router = express.Router();
// We require the database connection configuration
const connection = require('../db');
const passport = require('passport');

 //count portefeuille
 router.get('/portefeuille', passport.authenticate('jwt', { session:  false }), (req,resp) =>{
    let fieldValue = ''

    let sql = 'SELECT COUNT(DC_INDIVIDU_LOCAL) AS nb'
    sql += ' FROM T_Portefeuille INNER JOIN APE ON T_Portefeuille.DC_STRUCTUREPRINCIPALEDE = APE.id_APE'
    sql += ' WHERE DC_SITUATIONDE = 2'

    //DR Admin
     //http://localhost:5000/count/portefeuille

    //Conseiller
     //http://localhost:5000/count/portefeuille?dc_dernieragentreferent=P000617 - XXXX
    if (req.query.dc_dernieragentreferent) {
        fieldValue = req.query.dc_dernieragentreferent;
        sql += ' AND DC_DERNIERAGENTREFERENT = ? '
      }
    //ELP
     //http://localhost:5000/count/portefeuille?dc_structureprincipalede=97801  
    if (req.query.dc_structureprincipalede) {
        fieldValue = req.query.dc_structureprincipalede;
        sql += ' AND DC_STRUCTUREPRINCIPALEDE = ? '
      }
      //DTNE-DTSO
     //http://localhost:5000/count/portefeuille?dt=DTNE  
    if (req.query.dt) {
        fieldValue = req.query.dt;
        sql += ' AND  DT = ? '
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

//count EFO
router.get('/efo', passport.authenticate('jwt', { session:  false }), (req,resp) =>{
    let fieldValue = ''

    let sql = 'SELECT COUNT(DC_INDIVIDU_LOCAL) AS nb'
    sql += ' FROM T_EFO INNER JOIN APE ON T_EFO.DC_STRUCTUREPRINCIPALEDE = APE.id_APE'
   

    //DR Admin
     //http://localhost:5000/count/efo

    //Conseiller
     //http://localhost:5000/count/efo?dc_dernieragentreferent=P000617 - XXXX
    if (req.query.dc_dernieragentreferent) {
        fieldValue = req.query.dc_dernieragentreferent;
        sql += ' WHERE DC_DERNIERAGENTREFERENT = ? '
      }
    //ELP
     //http://localhost:5000/count/efo?dc_structureprincipalede=97801  
    if (req.query.dc_structureprincipalede) {
        fieldValue = req.query.dc_structureprincipalede;
        sql += ' WHERE DC_STRUCTUREPRINCIPALEDE = ? '
      }
      //DTNE-DTSO
     //http://localhost:5000/count/efo?dt=DTNE  
    if (req.query.dt) {
        fieldValue = req.query.dt;
        sql += ' WHERE  DT = ? '
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