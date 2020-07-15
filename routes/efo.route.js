
const express = require('express');
const router = express.Router();
const connection = require('../db');
const passport = require('passport');

//list filter efo
//liste filter situation DE
//http://localhost:5000/efo/listesituationde?
router.get('/listesituationde', passport.authenticate('jwt', { session:  false }), (req,resp) =>{
    const query = req.query;
 
    let sql = 'SELECT DISTINCT dc_situationde'
        sql+= ' FROM T_EFO INNER JOIN APE ON T_EFO.dc_structureprincipalede = APE.id_ape'
        
        let sqlValues = [];

        Object.keys(query).map((key, index) => {
            if (index === 0) {
                sql += ` WHERE ${key} = ?`
            }
            else {
                sql += ` AND ${key} = ?`
    
            } 
            sqlValues.push(query[key]) 
        })
    connection.query(sql, sqlValues, (err, results) => {
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

//list filter efo
//liste filter parcours
//http://localhost:5000/efo/listeparcours?
router.get('/listeparcours', passport.authenticate('jwt', { session:  false }), (req,resp) =>{
    const query = req.query;
 
    let sql = 'SELECT DISTINCT dc_parcours'
        sql+= ' FROM T_EFO INNER JOIN APE ON T_EFO.dc_structureprincipalede = APE.id_ape'
        
        let sqlValues = [];

        Object.keys(query).map((key, index) => {
            if (index === 0) {
                sql += ` WHERE ${key} = ?`
            }
            else {
                sql += ` AND ${key} = ?`
    
            } 
            sqlValues.push(query[key]) 
        })
    connection.query(sql, sqlValues, (err, results) => {
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


//list filter efo
//liste filter categorie
//http://localhost:5000/efo/listecategorie?
router.get('/listecategorie', passport.authenticate('jwt', { session:  false }), (req,resp) =>{
    const query = req.query;
 
    let sql = 'SELECT DISTINCT dc_categorie'
        sql+= ' FROM T_EFO INNER JOIN APE ON T_EFO.dc_structureprincipalede = APE.id_ape'
        
        let sqlValues = [];

        Object.keys(query).map((key, index) => {
            if (index === 0) {
                sql += ` WHERE ${key} = ?`
            }
            else {
                sql += ` AND ${key} = ?`
    
            } 
            sqlValues.push(query[key]) 
        })
    connection.query(sql, sqlValues, (err, results) => {
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

//list filter efo
//liste filter statut action
//http://localhost:5000/efo/listestatutaction?
router.get('/listestatutaction', passport.authenticate('jwt', { session:  false }), (req,resp) =>{
    const query = req.query;
 
    let sql = 'SELECT DISTINCT dc_statutaction_id'
        sql+= ' FROM T_EFO INNER JOIN APE ON T_EFO.dc_structureprincipalede = APE.id_ape'
        
        let sqlValues = [];

        Object.keys(query).map((key, index) => {
            if (index === 0) {
                sql += ` WHERE ${key} = ?`
            }
            else {
                sql += ` AND ${key} = ?`
    
            } 
            sqlValues.push(query[key]) 
        })
    connection.query(sql, sqlValues, (err, results) => {
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

//list filter efo
//liste filter statut formatcode
//http://localhost:5000/efo/listeformacode?
// router.get('/listeformacode', passport.authenticate('jwt', { session:  false }), (req,resp) =>{
//     const query = req.query;
 
//     let sql = 'SELECT DISTINCT dc_formacode_id, dc_lblformacode'
//         sql+= ' FROM T_EFO INNER JOIN APE ON T_EFO.dc_structureprincipalede = APE.id_ape'
        
//         let sqlValues = [];

//         Object.keys(query).map((key, index) => {
//             if (index === 0) {
//                 sql += ` WHERE ${key} = ?`
//             }
//             else {
//                 sql += ` AND ${key} = ?`
    
//             } 
//             sqlValues.push(query[key]) 
//         })
//     connection.query(sql, sqlValues, (err, results) => {
//         if (err) {
//             resp.status(500).send('Internal server error')
//         } else {
//             if (!results.length) {
//                 resp.status(404).send('datas not found')
//                 // resp.json([])
//             } else {
//                 // console.log(json(results))
//                 resp.json(results)
//             }
//         }
//     })
// })

//nb efo
//http://localhost:5000/efo?
router.get('/', passport.authenticate('jwt', { session:  false }), (req,resp) =>{
    const query = req.query;
   
    let sql ="SELECT count(t1.dc_individu_local) AS nbEFO, x.nbDEEFO, y.nbDE, CONCAT(FORMAT(x.nbDEEFO / y.nbDE * 100, 1),'%') as tx"
    sql+= " FROM T_EFO t1 INNER JOIN APE ON t1.dc_structureprincipalede = APE.id_ape ,"
    sql+="(SELECT COUNT(DISTINCT t2.dc_individu_local) AS nbDEEFO"
    sql+=" FROM T_EFO t2 INNER JOIN APE ON t2.dc_structureprincipalede = APE.id_ape"
    
    let sqlValues = [];
    
   
    Object.keys(query).filter((key) => query[key]!=='all').map((key, index) => {
        
        // dc_lblformacode
        if (key==='dc_lblformacode') {
            if (index === 0) {
                sql += ` WHERE t2.${key} LIKE "%" ? "%"`
            }
            else {
                sql += ` AND t2.${key} LIKE "%" ? "%"`
            } 

        } else  {
        
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
                    }        
            sqlValues.push(query[key])
        })
    

    sql+= ") x ,"
    sql+="(SELECT COUNT(DISTINCT dc_individu_local) AS nbDE"
    sql += ' FROM T_Portefeuille INNER JOIN APE ON T_Portefeuille.dc_structureprincipalede = APE.id_ape'
    
    Object.keys(query).filter((key) => query[key]!=='all' && key!=='dc_statutaction_id' && key!=='dc_lblformacode').map((key, index) => {
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
        
        if (key==='dc_lblformacode') {
            if (index === 0) {
                sql += ` WHERE t1.${key} LIKE "%" ? "%"`
            }
            else {
                sql += ` AND t1.${key} LIKE "%" ? "%"`
            } 

        } else  {
        
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