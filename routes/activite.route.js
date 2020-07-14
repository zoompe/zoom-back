
const express = require('express');
const router = express.Router();
const connection = require('../db');
const passport = require('passport');


//activites
//http://localhost:5000/activites?
router.get('/', passport.authenticate('jwt', { session:  false }), (req,resp) =>{
    const query = req.query;
   
    let sql ="SELECT count(t1.dc_individu_local) AS nbEFO, x.nbDEEFO, y.nbDE, CONCAT(FORMAT(x.nbDEEFO / y.nbDE * 100, 1),'%') as tx"
    sql+= " FROM T_EFO t1 INNER JOIN APE ON t1.dc_structureprincipalede = APE.id_ape ,"
    sql+="(SELECT COUNT(DISTINCT t2.dc_individu_local) AS nbDEEFO"
    sql+=" FROM T_EFO t2 INNER JOIN APE ON t2.dc_structureprincipalede = APE.id_ape"
    
    let sqlValues = [];
    
   
    Object.keys(query).filter((key) => query[key]!=='all').map((key, index) => {
        
            if (key==='dt') {
                if (index === 0) {
                    sql += ` WHERE ${key} = ?`
                }
                else {
                    sql += ` AND ${key} = ?`
        
                } 
            }
            else {
                if (index === 0) {
                    sql += ` WHERE t2.${key} = ?`
                }
                else {
                    sql += ` AND t2.${key} = ?`
                } 
            }
            
            sqlValues.push(query[key])
        })
    

    sql+= ") x ,"
    sql+="(SELECT COUNT(DISTINCT dc_individu_local) AS nbDE"
    sql += ' FROM T_Portefeuille INNER JOIN APE ON T_Portefeuille.dc_structureprincipalede = APE.id_ape'
    
    Object.keys(query).filter((key) => query[key]!=='all' && key!=='dc_statutaction_id' && key!=='dc_formacode_id').map((key, index) => {
        if (index === 0) {
            sql += ` WHERE ${key} = ?`
        }
        else {
            sql += ` AND ${key} = ?`

        } 
        sqlValues.push(query[key])
    })

    sql+= ") y"
        
    
    Object.keys(query).filter((key) => query[key]!=='all').map((key, index) => {
        
        if (key==='dt') {
            if (index === 0) {
                sql += ` WHERE ${key} = ?`
            }
            else {
                sql += ` AND ${key} = ?`
    
            } 
        }
        else {
            if (index === 0) {
                sql += ` WHERE t1.${key} = ?`
            }
            else {
                sql += ` AND t1.${key} = ?`
    
            } 
        }
        
        
        sqlValues.push(query[key])
    })

    sql+= " Group by x.nbDEEFO,y.nbDE"

    // console.log(sql)
    // console.log(sqlValues)
    // console.log(query)
    connection.query(sql, sqlValues, (err, results) => {
        if (err) {
            resp.status(500).send('Internal server error')
        } else {
            if (!results.length || results===undefined) {
                // resp.status(404).send('datas not found')
                resp.json([])
            } else {
                // console.log(json(results))
                resp.json(results)
            }
        }
    })
})
//END



module.exports = router;