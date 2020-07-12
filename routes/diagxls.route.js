
const express = require('express');
const router = express.Router();
const connection = require('../db');
const passport = require('passport');
const excel = require('exceljs');
const { response } = require('express');


//select excel diag ide
//http://localhost:5000/diagxlsx/ide?colonne113=O
router.use('/ide', passport.authenticate('jwt', { session:  false }), (req,resp) => {
    const query = req.query;
   
    let sql = ""
        sql += `SELECT dc_individu_local, dc_civilite, dc_nom, dc_prenom, dc_categorie`
        sql += ' FROM T_Portefeuille INNER JOIN APE ON T_Portefeuille.dc_structureprincipalede = APE.id_ape'
        sql += ' WHERE dc_situationde = 2'

    let sqlValues = [];
    
    Object.keys(query).map((key, index) => {
        sql += ` AND ${key} = ?`
        sqlValues.push(query[key])
    })

    // console.log(sql)
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
                    { header: 'dc_individu_local', key: 'dc_individu_local', width: 10 },
                    { header: 'dc_civilite', key: 'dc_civilite', width: 30 },
                    { header: 'dc_nom', key: 'dc_nom', width: 30},
                    { header: 'dc_prenom', key: 'dc_prenom', width: 30 },
                    { header: 'dc_categorie', key: 'dc_categorie', width: 10, outlineLevel: 1}
                ];
                worksheet.addRows(jsonResult);
  
                resp.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                resp.setHeader('Content-Disposition', 'attachment; filename=' + 'diagIde.xlsx');  
                return workbook.xlsx.write(resp)
                .then(function() {
                      resp.status(200).end();
                });
        

                    }
                }
            })
        })
                

//END

//select excel diag ref
//http://localhost:5000/diagxlsx/ref?colonne113=O
router.use('/ref', passport.authenticate('jwt', { session:  false }), (req,resp) => {
    const query = req.query;

//     Select t1.dc_dernieragentreferent, t1.nbCriteres, t2. nbDE, CONCAT(FORMAT(t1.nbCriteres / t2. nbDE * 100, 1),'%') as tx FROM 
// (SELECT p1.dc_dernieragentreferent, count(p1.dc_individu_local) as nbCriteres
//  FROM T_Portefeuille p1 INNER JOIN APE a1 ON p1.dc_structureprincipalede = a1.id_ape
//  WHERE p1.dc_situationde = 2 AND p1.dc_structureprincipalede = 97801 and p1.colonne42='B'
//  Group BY p1.dc_dernieragentreferent) as t1 INNER JOIN 
//  (SELECT p2.dc_dernieragentreferent, count(p2.dc_individu_local) as nbDE
//  FROM T_Portefeuille p2 INNER JOIN APE a2 ON p2.dc_structureprincipalede = a2.id_ape
//  WHERE p2.dc_situationde = 2 AND p2.dc_structureprincipalede = 97801
//  Group BY p2.dc_dernieragentreferent) as t2 ON t2.dc_dernieragentreferent=t1.dc_dernieragentreferent


    let sql = "SELECT t2.dc_dernieragentreferent, CASE WHEN t1.nbDECriteres IS NULL THEN 0 ELSE t1.nbDECriteres END AS nbDECriteres, t2.nbDE, nbDECriteres / t2. nbDE  as tx FROM "
        sql += '(SELECT p1.dc_dernieragentreferent, count(p1.dc_individu_local) as nbDECriteres'
        sql += ' FROM T_Portefeuille p1 INNER JOIN APE a1 ON p1.dc_structureprincipalede = a1.id_ape'
        sql += ' WHERE p1.dc_situationde = 2'

    let sqlValues = [];
    
    Object.keys(query).map((key, index) => {
        if (key==='dt') {
            sql += ` AND a1.${key} = ?`
            sqlValues.push(query[key])
        }
        else {
        sql += ` AND p1.${key} = ?`
        sqlValues.push(query[key])
        }

    })

        sql+=' GROUP BY p1.dc_dernieragentreferent) as t1 RIGHT JOIN '
        sql+='(SELECT p2.dc_dernieragentreferent, count(p2.dc_individu_local) as nbDE '
        sql+=' FROM T_Portefeuille p2 INNER JOIN APE a2 ON p2.dc_structureprincipalede = a2.id_ape'
        sql+=' WHERE p2.dc_situationde = 2'

        Object.keys(query).filter((key) => key==='dc_dernieragentreferent' || key==='dc_structureprincipalede' || key==='dt').map((key, index) => {
                if (key==='dt') {
                    sql += ` AND a2.${key} = ?`
                    sqlValues.push(query[key])
                }
                else {
                sql += ` AND p2.${key} = ?`
                sqlValues.push(query[key])
                }
        
            })
        
        sql+=' GROUP BY p2.dc_dernieragentreferent) as t2 ON t2.dc_dernieragentreferent=t1.dc_dernieragentreferent'    


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
                let worksheet = workbook.addWorksheet('IDE'); //creating worksheet
                worksheet.columns = [
                    { header: 'dc_dernieragentreferent', key: 'dc_dernieragentreferent', width: 20 },
                    { header: 'nbDECriteres', key: 'nbDECriteres', width: 10 },
                    { header: 'nbDE', key: 'nbDE', width: 10},
                    { header: 'taux', key: 'tx', width: 10 },
                    
                ];
                worksheet.addRows(jsonResult);
  
                resp.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                resp.setHeader('Content-Disposition', 'attachment; filename=' + 'diagRef.xlsx');  
                return workbook.xlsx.write(resp)
                .then(function() {
                      resp.status(200).end();
                });
        

                    }
                }
            })
        })
                

//END

//select excel diag ape
//http://localhost:5000/diagxlsx/ape?colonne113=O
router.use('/ape', passport.authenticate('jwt', { session:  false }), (req,resp) => {
    const query = req.query;

    let sql = "SELECT t2.dc_structureprincipalede, CASE WHEN t1.nbDECriteres IS NULL THEN 0 ELSE t1.nbDECriteres END AS nbDECriteres, t2.nbDE, nbDECriteres / t2. nbDE  as tx FROM "
        sql += '(SELECT p1.dc_structureprincipalede, count(p1.dc_individu_local) as nbDECriteres'
        sql += ' FROM T_Portefeuille p1 INNER JOIN APE a1 ON p1.dc_structureprincipalede = a1.id_ape'
        sql += ' WHERE p1.dc_situationde = 2'

    let sqlValues = [];
    
    Object.keys(query).map((key, index) => {
        if (key==='dt') {
            sql += ` AND a1.${key} = ?`
            sqlValues.push(query[key])
        }
        else {
        sql += ` AND p1.${key} = ?`
        sqlValues.push(query[key])
        }

    })

        sql+=' GROUP BY p1.dc_structureprincipalede) as t1 RIGHT JOIN '
        sql+='(SELECT p2.dc_structureprincipalede, count(p2.dc_individu_local) as nbDE '
        sql+=' FROM T_Portefeuille p2 INNER JOIN APE a2 ON p2.dc_structureprincipalede = a2.id_ape'
        sql+=' WHERE p2.dc_situationde = 2'

        Object.keys(query).filter((key) => key==='dc_dernieragentreferent' || key==='dc_structureprincipalede' || key==='dt').map((key, index) => {
                if (key==='dt') {
                    sql += ` AND a2.${key} = ?`
                    sqlValues.push(query[key])
                }
                else {
                sql += ` AND p2.${key} = ?`
                sqlValues.push(query[key])
                }
        
            })
        
        sql+=' GROUP BY p2.dc_structureprincipalede) as t2 ON t2.dc_structureprincipalede=t1.dc_structureprincipalede'    


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
                let worksheet = workbook.addWorksheet('IDE'); //creating worksheet
                worksheet.columns = [
                    { header: 'dc_structureprincipalede', key: 'dc_structureprincipalede', width: 20 },
                    { header: 'nbDECriteres', key: 'nbDECriteres', width: 10 },
                    { header: 'nbDE', key: 'nbDE', width: 10},
                    { header: 'taux', key: 'tx', width: 10 },
                    
                ];
                worksheet.addRows(jsonResult);
  
                resp.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                resp.setHeader('Content-Disposition', 'attachment; filename=' + 'diagApe.xlsx');  
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