
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

    let sql = 'SELECT DC_LBLMOTIFJALONPERSONNALISE,'
    sql += ' CASE'
    sql += ' WHEN NbjourAvantJalon IS NULL THEN "Sans Jalons"'
    sql += ' WHEN NbjourAvantJalon < 0 THEN "Jalons dépassés"'
    sql += ` WHEN NbjourAvantJalon BETWEEN ${int1[0]} AND ${int1[1]} THEN "Entre ${int1[0]} et ${int1[1]} jours"`
    sql += ` WHEN NbjourAvantJalon BETWEEN ${int2[0]} AND ${int2[1]} THEN "Entre ${int2[0]} et ${int2[1]} jours"`
    sql += ` WHEN NbjourAvantJalon > ${int2[1]} THEN "> ${int2[1]} jours"`
    sql += ' ELSE "jalons"'
    sql += ' END AS TextNbjourAvantJalon,'
    sql += ' COUNT(DC_INDIVIDU_LOCAL) AS nb'
    sql += ' FROM T_Portefeuille INNER JOIN APE ON T_Portefeuille.DC_STRUCTUREPRINCIPALEDE = APE.id_APE'
    sql += ' WHERE DC_SITUATIONDE = 2'

    //DR Admin
     //http://localhost:3000/api/sourceefo

    //Conseiller
     //http://localhost:3000/api/sourceefo?dc_dernieragentreferent=P000617 - XXXX
    if (req.query.dc_dernieragentreferent) {
        fieldValue = req.query.dc_dernieragentreferent;
        sql += ' AND DC_DERNIERAGENTREFERENT = ? '
      }
    //ELP
     //http://localhost:3000/api/sourceefo?dc_structureprincipalede=97801  
    if (req.query.dc_structureprincipalede) {
        fieldValue = req.query.dc_structureprincipalede;
        sql += ' AND DC_STRUCTUREPRINCIPALEDE = ? '
      }
      //DTNE-DTSO
     //http://localhost:3000/api/sourceefo?dt=DTNE  
    if (req.query.dt) {
        fieldValue = req.query.dt;
        sql += ' AND  DT = ? '
      }
   
    sql += ' GROUP BY DC_LBLMOTIFJALONPERSONNALISE, TextNbjourAvantJalon;'
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