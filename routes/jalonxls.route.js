
const express = require('express');
const router = express.Router();
const connection = require('../db');
const passport = require('passport');
const excel = require('exceljs');

//select excel jalon ide
//http://localhost:5000/jalonxlsx/ide?
router.use('/ide', passport.authenticate('jwt', { session:  false }), (req,resp) => {
    const query = req.query;
    const int1= [0,30];
    const int2= [int1[1] + 1, 60];

    let sql = 'SELECT dc_lblmotifjalonpersonnalise,dc_individu_local, dc_civilite, dc_nom, dc_prenom, dc_categorie,'
    sql += ' CASE'
    sql += ' WHEN nbjouravantjalon IS NULL THEN "Sans Jalons"'
    sql += ' WHEN nbjouravantjalon < 0 THEN "Jalons dépassés"'
    sql += ` WHEN nbjouravantjalon BETWEEN ${int1[0]} AND ${int1[1]} THEN "Entre ${int1[0]} et ${int1[1]} jours"`
    sql += ` WHEN nbjouravantjalon BETWEEN ${int2[0]} AND ${int2[1]} THEN "Entre ${int2[0]} et ${int2[1]} jours"`
    sql += ` WHEN nbjouravantjalon > ${int2[1]} THEN "> ${int2[1]} jours"`
    sql += ' ELSE "jalons"'
    sql += ' END AS textnbjouravantjalon'
    sql += ' FROM T_Portefeuille INNER JOIN APE ON T_Portefeuille.dc_structureprincipalede = APE.id_ape'
    sql += ' WHERE dc_situationde = 2 AND nbjouravantjalon IS NOT NULL'

    
    let sqlValues = [];
    
    Object.keys(query).map((key, index) => {
                sql += ` AND ${key} = ?`
        sqlValues.push(query[key])
    })

    console.log(sql)
    console.log(sqlValues)
    connection.query(sql, sqlValues, (err, results) => {
                if (err) {
                    resp.status(500).send('Internal server error')
                } else {
                    if (!results.length) {
                        resp.status(404).send('datas not found')
                    } else {
                const jsonResult = JSON.parse(JSON.stringify(results));
                let workbook = new excel.Workbook(); //creating workbook
                let worksheet = workbook.addWorksheet('IDE'); //creating worksheet
                worksheet.columns = [
                    { header: 'dc_lblmotifjalonpersonnalise', key: 'dc_lblmotifjalonpersonnalise', width: 10 },
                    { header: 'dc_individu_local', key: 'dc_individu_local', width: 10 },
                    { header: 'dc_civilite', key: 'dc_civilite', width: 30 },
                    { header: 'dc_nom', key: 'dc_nom', width: 30},
                    { header: 'dc_prenom', key: 'dc_prenom', width: 30 },
                    { header: 'dc_categorie', key: 'dc_categorie', width: 10, outlineLevel: 1},
                    { header: 'textnbjouravantjalon', key: 'textnbjouravantjalon', width: 10, outlineLevel: 1},
                ];

                worksheet.addRows(jsonResult);
                resp.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                resp.setHeader('Content-Disposition', 'attachment; filename=' + 'jalonIde.xlsx');  
                return workbook.xlsx.write(resp)
                .then(function() {
                      resp.status(200).end();
                });
        
                    }
                }
            })
        })

//END

//select excel efo ref
//http://localhost:5000/efoxlsx/ref?
router.use('/ref', passport.authenticate('jwt', { session:  false }), (req,resp) => {
    const query = req.query;

//     Select t3.dc_dernieragentreferent, CASE WHEN t1.nbEFO  IS NULL THEN 0 ELSE t1.nbEFO END AS nbEFO,
//     CASE WHEN t2.nbDEEFO  IS NULL THEN 0 ELSE t2.nbDEEFO END AS nbDEEFO, t3.nbDE,
//     nbDEEFO / t3. nbDE  as tx 
    
//     FROM
// (SELECT p1.dc_dernieragentreferent, count(p1.dc_individu_local) as nbEFO
//  FROM T_EFO p1 INNER JOIN APE a1 ON p1.dc_structureprincipalede = a1.id_ape
//  WHERE p1.dc_structureprincipalede = 97801 and p1.dc_statutaction_id='O'
//  Group BY p1.dc_dernieragentreferent) as t1 INNER JOIN 

//  (SELECT x.dc_dernieragentreferent, count(x.dc_individu_local) as nbDEEFO
// FROM 
//     (SELECT DISTINCT p2.dc_individu_local, p2.dc_dernieragentreferent
//     FROM T_EFO p2 INNER JOIN APE a2 ON p2.dc_structureprincipalede = a2.id_ape
//     WHERE p2.dc_structureprincipalede = 97801 and p2.dc_statutaction_id='O'
//     ) x
//  Group by x.dc_dernieragentreferent 
//  ) as t2 ON t2.dc_dernieragentreferent=t1.dc_dernieragentreferent

//     RIGHT JOIN 
//         (SELECT p3.dc_dernieragentreferent, count(p3.dc_individu_local) as nbDE 
//          FROM T_Portefeuille p3 INNER JOIN APE a3 ON p3.dc_structureprincipalede = a3.id_ape
//          WHERE p3.dc_structureprincipalede = 97801
//          GROUP BY p3.dc_dernieragentreferent
//         ) as t3 ON t3.dc_dernieragentreferent=t1.dc_dernieragentreferent 


    let sql = 'Select t3.dc_dernieragentreferent, CASE WHEN t1.nbEFO  IS NULL THEN 0 ELSE t1.nbEFO END AS nbEFO,'
        sql+= ' CASE WHEN t2.nbDEEFO  IS NULL THEN 0 ELSE t2.nbDEEFO END AS nbDEEFO, t3.nbDE,'
        sql+= ' nbDEEFO / t3. nbDE  as tx FROM'
        sql+= '(SELECT p1.dc_dernieragentreferent, count(p1.dc_individu_local) as nbEFO'
        sql+= ' FROM T_EFO p1 INNER JOIN APE a1 ON p1.dc_structureprincipalede = a1.id_ape'
 
    let sqlValues = [];
    
    Object.keys(query).filter((key) => query[key]!=='all').map((key, index) => {
        
        if (key==='dt') {
            if (index === 0) {
                sql += ` WHERE a1.${key} = ?`
            }
            else {
                sql += ` AND a1.${key} = ?`
    
            } 
        }
        else {
            if (index === 0) {
                sql += ` WHERE p1.${key} = ?`
            }
            else {
                sql += ` AND p1.${key} = ?`
    
            } 
        }
        sqlValues.push(query[key])
    })

    sql+=' GROUP BY p1.dc_dernieragentreferent) as t1 INNER JOIN'
    sql+=' (SELECT x.dc_dernieragentreferent, count(x.dc_individu_local) as nbDEEFO FROM'
    sql+=' (SELECT DISTINCT p2.dc_individu_local, p2.dc_dernieragentreferent'
    sql+=' FROM T_EFO p2 INNER JOIN APE a2 ON p2.dc_structureprincipalede = a2.id_ape'
   
    
    Object.keys(query).filter((key) => query[key]!=='all').map((key, index) => {
        
        if (key==='dt') {
            if (index === 0) {
                sql += ` WHERE a2.${key} = ?`
            }
            else {
                sql += ` AND a2.${key} = ?`
    
            } 
        }
        else {
            if (index === 0) {
                sql += ` WHERE p2.${key} = ?`
            }
            else {
                sql += ` AND p2.${key} = ?`
    
            } 
        }
        sqlValues.push(query[key])
    })
    

    sql+=') x Group by x.dc_dernieragentreferent'
    sql+=') as t2 ON t2.dc_dernieragentreferent=t1.dc_dernieragentreferent'
    sql+=' RIGHT JOIN'
    sql+=' (SELECT p3.dc_dernieragentreferent, count(p3.dc_individu_local) as nbDE'
    sql+=' FROM T_Portefeuille p3 INNER JOIN APE a3 ON p3.dc_structureprincipalede = a3.id_ape'

    Object.keys(query).filter((key) => query[key]!=='all' && key!=='dc_statutaction_id' && key!=='dc_formacode_id').map((key, index) => {
        
        if (key==='dt') {
            if (index === 0) {
                sql += ` WHERE a3.${key} = ?`
            }
            else {
                sql += ` AND a3.${key} = ?`
    
            } 
        }
        else {
            if (index === 0) {
                sql += ` WHERE p3.${key} = ?`
            }
            else {
                sql += ` AND p3.${key} = ?`
    
            } 
        }
        sqlValues.push(query[key])
    })

   sql+=' GROUP BY p3.dc_dernieragentreferent'
   sql+=') as t3 ON t3.dc_dernieragentreferent=t1.dc_dernieragentreferent' 
    

    // console.log(sql)
    // console.log(sqlValues)
    connection.query(sql, sqlValues, (err, results) => {
                if (err) {
                    resp.status(500).send('Internal server error')
                } else {
                    if (!results.length) {
                        resp.status(404).send('datas not found')
                    } else {
                const jsonResult = JSON.parse(JSON.stringify(results));
                let workbook = new excel.Workbook(); //creating workbook
                let worksheet = workbook.addWorksheet('REF'); //creating worksheet
                worksheet.columns = [
                    { header: 'dc_dernieragentreferent', key: 'dc_dernieragentreferent', width: 20 },
                    { header: 'nbEFO', key: 'nbEFO', width: 10 },
                    { header: 'nbDEEFO', key: 'nbDEEFO', width: 10 },
                    { header: 'nbDE', key: 'nbDE', width: 10},
                    { header: 'taux', key: 'tx', width: 10 },
                    
                ];
                worksheet.addRows(jsonResult);
  
                resp.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                resp.setHeader('Content-Disposition', 'attachment; filename=' + 'efoREF.xlsx');  
                return workbook.xlsx.write(resp)
                .then(function() {
                      resp.status(200).end();
                });
        

                    }
                }
            })
        })
                

//END

//select excel efo ape
//http://localhost:5000/efoxlsx/ape?
router.use('/ape', passport.authenticate('jwt', { session:  false }), (req,resp) => {
    const query = req.query;

    let sql = 'Select t3.dc_structureprincipalede, CASE WHEN t1.nbEFO  IS NULL THEN 0 ELSE t1.nbEFO END AS nbEFO,'
        sql+= ' CASE WHEN t2.nbDEEFO  IS NULL THEN 0 ELSE t2.nbDEEFO END AS nbDEEFO, t3.nbDE,'
        sql+= ' nbDEEFO / t3. nbDE  as tx FROM'
        sql+= '(SELECT p1.dc_structureprincipalede, count(p1.dc_individu_local) as nbEFO'
        sql+= ' FROM T_EFO p1 INNER JOIN APE a1 ON p1.dc_structureprincipalede = a1.id_ape'
 
    let sqlValues = [];
    
    Object.keys(query).filter((key) => query[key]!=='all').map((key, index) => {
        
        if (key==='dt') {
            if (index === 0) {
                sql += ` WHERE a1.${key} = ?`
            }
            else {
                sql += ` AND a1.${key} = ?`
    
            } 
        }
        else {
            if (index === 0) {
                sql += ` WHERE p1.${key} = ?`
            }
            else {
                sql += ` AND p1.${key} = ?`
    
            } 
        }
        sqlValues.push(query[key])
    })

    sql+=' GROUP BY p1.dc_structureprincipalede) as t1 INNER JOIN'
    sql+=' (SELECT x.dc_structureprincipalede, count(x.dc_individu_local) as nbDEEFO FROM'
    sql+=' (SELECT DISTINCT p2.dc_individu_local, p2.dc_structureprincipalede'
    sql+=' FROM T_EFO p2 INNER JOIN APE a2 ON p2.dc_structureprincipalede = a2.id_ape'
   
    
    Object.keys(query).filter((key) => query[key]!=='all').map((key, index) => {
        
        if (key==='dt') {
            if (index === 0) {
                sql += ` WHERE a2.${key} = ?`
            }
            else {
                sql += ` AND a2.${key} = ?`
    
            } 
        }
        else {
            if (index === 0) {
                sql += ` WHERE p2.${key} = ?`
            }
            else {
                sql += ` AND p2.${key} = ?`
    
            } 
        }
        sqlValues.push(query[key])
    })
    

    sql+=') x Group by x.dc_structureprincipalede'
    sql+=') as t2 ON t2.dc_structureprincipalede=t1.dc_structureprincipalede'
    sql+=' RIGHT JOIN'
    sql+=' (SELECT p3.dc_structureprincipalede, count(p3.dc_individu_local) as nbDE'
    sql+=' FROM T_Portefeuille p3 INNER JOIN APE a3 ON p3.dc_structureprincipalede = a3.id_ape'

    Object.keys(query).filter((key) => query[key]!=='all' && key!=='dc_statutaction_id' && key!=='dc_formacode_id').map((key, index) => {
        
        if (key==='dt') {
            if (index === 0) {
                sql += ` WHERE a3.${key} = ?`
            }
            else {
                sql += ` AND a3.${key} = ?`
    
            } 
        }
        else {
            if (index === 0) {
                sql += ` WHERE p3.${key} = ?`
            }
            else {
                sql += ` AND p3.${key} = ?`
    
            } 
        }
        sqlValues.push(query[key])
    })

   sql+=' GROUP BY p3.dc_structureprincipalede'
   sql+=') as t3 ON t3.dc_structureprincipalede=t1.dc_structureprincipalede' 
    

    // console.log(sql)
    // console.log(sqlValues)
    connection.query(sql, sqlValues, (err, results) => {
                if (err) {
                    resp.status(500).send('Internal server error')
                } else {
                    if (!results.length) {
                        resp.status(404).send('datas not found')
                    } else {
                const jsonResult = JSON.parse(JSON.stringify(results));
                let workbook = new excel.Workbook(); //creating workbook
                let worksheet = workbook.addWorksheet('APE'); //creating worksheet
                worksheet.columns = [
                    { header: 'dc_structureprincipalede', key: 'dc_structureprincipalede', width: 20 },
                    { header: 'nbEFO', key: 'nbEFO', width: 10 },
                    { header: 'nbDEEFO', key: 'nbDEEFO', width: 10 },
                    { header: 'nbDE', key: 'nbDE', width: 10},
                    { header: 'taux', key: 'tx', width: 10 },
                    
                ];
                worksheet.addRows(jsonResult);
  
                resp.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                resp.setHeader('Content-Disposition', 'attachment; filename=' + 'efoAPE.xlsx');  
                return workbook.xlsx.write(resp)
                .then(function() {
                      resp.status(200).end();
                });
        

                    }
                }
            })
        })
                

//END




module.exports = router;