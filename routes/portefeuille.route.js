
// We always need to require express in every route file
const express = require('express');
// We create the express router 
const router = express.Router();
// We require the database connection configuration
const connection = require('../db');

    
 //jalons
 router.get('/', (req,resp) =>{
    let fieldValue = ''
    const int1= [0,30];
    const int2= [int1[1] + 1,60];

    let sql = 'SELECT dc_lblmotifjalonpersonnalise,'
    sql += ' CASE'
    sql += ' WHEN nbjouravantjalon IS NULL THEN "Sans Jalons"'
    sql += ' WHEN nbjouravantjalon < 0 THEN "Jalons dépassés"'
    sql += ` WHEN nbjouravantjalon BETWEEN ${int1[0]} AND ${int1[1]} THEN "Entre ${int1[0]} et ${int1[1]} jours"`
    sql += ` WHEN nbjouravantjalon BETWEEN ${int2[0]} AND ${int2[1]} THEN "Entre ${int2[0]} et ${int2[1]} jours"`
    sql += ` WHEN nbjouravantjalon > ${int2[1]} THEN "> ${int2[1]} jours"`
    sql += ' ELSE "jalons"'
    sql += ' END AS textnbjouravantjalon,'
    sql += ' COUNT(dc_individu_local) AS nb'
    sql += ' FROM T_Portefeuille INNER JOIN APE ON T_Portefeuille.dc_structureprincipalede = APE.id_ape'
    sql += ' WHERE dc_situationde = 2'

    //DR Admin
     //http://localhost:3000/api/sourceefo

    //Conseiller
     //http://localhost:3000/api/sourceefo?dc_dernieragentreferent=P000617 - XXXX
    if (req.query.dc_dernieragentreferent) {
        fieldValue = req.query.dc_dernieragentreferent;
        sql += ' AND dc_dernieragentreferent = ? '
      }
    //ELP
     //http://localhost:3000/api/sourceefo?dc_structureprincipalede=97801  
    if (req.query.dc_structureprincipalede) {
        fieldValue = req.query.dc_structureprincipalede;
        sql += ' AND dc_structureprincipalede = ? '
      }
      //DTNE-DTSO
     //http://localhost:3000/api/sourceefo?dt=DTNE  
    if (req.query.dt) {
        fieldValue = req.query.dt;
        sql += ' AND  dt = ? '
      }
   
    sql += ' GROUP BY dc_lblmotifjalonpersonnalise, textnbjouravantjalon;'
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


module.exports = router;