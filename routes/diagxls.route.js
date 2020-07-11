
const express = require('express');
const router = express.Router();
const connection = require('../db');
const passport = require('passport');
const excel = require('exceljs');
const { response } = require('express');


//select excel diag
//http://localhost:5000/diagcsv/ide?colonne113=O
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




module.exports = router;