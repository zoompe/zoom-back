
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

    let sql = 'SELECT *,'
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
                let worksheet = workbook.addWorksheet('IDE',{views: [{showGridLines: false}]});; //creating worksheet
                worksheet.columns = [
                    { header: 'Motif Jalon', key: 'dc_lblmotifjalonpersonnalise' },
                    { header: 'APE', key: 'dc_structureprincipalede'},
                    { header: 'Référent', key: 'dc_dernieragentreferent'},
                    { header: 'IDE', key: 'dc_individu_local'},
                    { header: 'Civilité', key: 'dc_civilite'},
                    { header: 'Nom', key: 'dc_nom'},
                    { header: 'Prénom', key: 'dc_prenom'},
                    { header: 'Catégorie', key: 'dc_categorie'},
                    { header: 'Situation', key: 'dc_situationde'},
                    { header: 'Parcours', key: 'dc_parcours'},
                    { header: 'Mail', key: 'dc_adresseemail'},
                    { header: 'Tel', key: 'dc_telephone'},
                    { header: 'Interval jalon', key: 'textnbjouravantjalon'},
                ];

               
                worksheet.columns.forEach(column => {
                    column.width = column.header.length < 5 ? 10 : column.header.length + 2
                  })

                worksheet.addRows(jsonResult);
                
                worksheet.getRow(1).eachCell((cell) => {
                    cell.font = { bold: true };
                  });
                  for (let i =1; i<=worksheet.columns.length;i++){
                  worksheet.getColumn(i).eachCell((cell) => {
                    cell.border = {
                        top: { style: 'thin' }, bottom: { style: 'thin' },
                      };
                  });
                }
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

//select excel jalon ref
//http://localhost:5000/jalonxlsx/ref?
router.use('/ref', passport.authenticate('jwt', { session:  false }), (req,resp) => {
    const query = req.query;

    // SELECT x.dc_lblmotifjalonpersonnalise, x.dc_dernieragentreferent,    
    // MAX(CASE WHEN x.textnbjouravantjalon = "Sans Jalons" THEN x.nb ELSE 0 END) "Sans Jalons",
    // MAX(CASE WHEN x.textnbjouravantjalon = "Jalons dépassés" THEN x.nb ELSE 0 END) "Jalons dépassés",
    // MAX(CASE WHEN x.textnbjouravantjalon = "Entre ${int1[0]} et ${int1[1]} jours" THEN x.nb ELSE 0 END) "Entre ${int1[0]} et ${int1[1]} jours",
    // MAX(CASE WHEN x.textnbjouravantjalon = "Entre ${int2[0]} et ${int2[1]} jours" THEN x.nb ELSE 0 END) "Entre ${int2[0]} et ${int2[1]} jours",
    // MAX(CASE WHEN x.textnbjouravantjalon = "> ${int2[1]} jours" THEN x.nb ELSE 0 END) "> ${int2[1]} jours",
    // SUM(x.nb) Total
    // FROM 
    // (SELECT dc_lblmotifjalonpersonnalise, dc_dernieragentreferent,
    //  CASE WHEN nbjouravantjalon IS NULL THEN "Sans Jalons"
    //         WHEN nbjouravantjalon < 0 THEN "Jalons dépassés"
    //         WHEN nbjouravantjalon BETWEEN 0 AND 20 THEN "Entre 0 et 20 jours"
    //         WHEN nbjouravantjalon BETWEEN 21 AND 30 THEN "Entre 21 et 30 jours"
    //         WHEN nbjouravantjalon > 30 THEN "> 30 jours"
    //         ELSE "jalons"
    //         END AS textnbjouravantjalon,
    //            COUNT(dc_individu_local) AS nb
    //            FROM T_Portefeuille INNER JOIN APE ON T_Portefeuille.dc_structureprincipalede = APE.id_ape
    //         WHERE dc_situationde = 2
    //         GROUP BY dc_lblmotifjalonpersonnalise, dc_dernieragentreferent, textnbjouravantjalon) x
    
    // GROUP BY x.dc_lblmotifjalonpersonnalise, x.dc_dernieragentreferent

    let fieldValue = ''
    const int1= [0,30];
    const int2= [int1[1] + 1, 60];

let sql = 'SELECT x.dc_lblmotifjalonpersonnalise, x.dc_dernieragentreferent,'    
sql+=` MAX(CASE WHEN x.textnbjouravantjalon = "Sans Jalons" THEN x.nb ELSE 0 END) "Sans Jalons",`
sql+=` MAX(CASE WHEN x.textnbjouravantjalon = "Jalons dépassés" THEN x.nb ELSE 0 END) "Jalons dépassés",`
sql+=` MAX(CASE WHEN x.textnbjouravantjalon = "Entre ${int1[0]} et ${int1[1]} jours" THEN x.nb ELSE 0 END) "Entre ${int1[0]} et ${int1[1]} jours",`
sql+=` MAX(CASE WHEN x.textnbjouravantjalon = "Entre ${int2[0]} et ${int2[1]} jours" THEN x.nb ELSE 0 END) "Entre ${int2[0]} et ${int2[1]} jours",`
sql+=` MAX(CASE WHEN x.textnbjouravantjalon = "> ${int2[1]} jours" THEN x.nb ELSE 0 END) "> ${int2[1]} jours",`
sql+=` SUM(x.nb) Total`
sql+=' FROM ('

    sql += 'SELECT dc_lblmotifjalonpersonnalise, dc_dernieragentreferent,'
    sql += ' CASE'
    sql += ' WHEN nbjouravantjalon < 0 THEN "Jalons dépassés"'
    sql += ` WHEN nbjouravantjalon BETWEEN ${int1[0]} AND ${int1[1]} THEN "Entre ${int1[0]} et ${int1[1]} jours"`
    sql += ` WHEN nbjouravantjalon BETWEEN ${int2[0]} AND ${int2[1]} THEN "Entre ${int2[0]} et ${int2[1]} jours"`
    sql += ` WHEN nbjouravantjalon > ${int2[1]} THEN "> ${int2[1]} jours"`
    sql += ' ELSE "jalons"'
    sql += ' END AS textnbjouravantjalon,'
    sql += ' COUNT(dc_individu_local) AS nb'
    sql += ' FROM T_Portefeuille INNER JOIN APE ON T_Portefeuille.dc_structureprincipalede = APE.id_ape'
    sql += ' WHERE dc_situationde = 2 AND nbjouravantjalon IS NOT NULL' 

    //DR Admin
     //http://localhost:3000/jalons

    //Conseiller
     //http://localhost:3000/jalons?dc_dernieragentreferent=P000617
    if (req.query.dc_dernieragentreferent) {
        fieldValue = req.query.dc_dernieragentreferent;
        sql += ' AND dc_dernieragentreferent = ? '
      }
    //ELP
     //http://localhost:3000/jalons?dc_structureprincipalede=97801  
    if (req.query.dc_structureprincipalede) {
        fieldValue = req.query.dc_structureprincipalede;
        sql += ' AND dc_structureprincipalede = ? '
      }
      //DTNE-DTSO
     //http://localhost:3000/jalons?dt=DTNE  
    if (req.query.dt) {
        fieldValue = req.query.dt;
        sql += ' AND  dt = ? '
      }
   
    sql += ' GROUP BY dc_lblmotifjalonpersonnalise, dc_dernieragentreferent, textnbjouravantjalon) x'
    sql += ' GROUP BY x.dc_lblmotifjalonpersonnalise, x.dc_dernieragentreferent'

    // console.log(sql)
    connection.query(sql, [fieldValue], (err, results) => {
        if (err) {
            resp.status(500).send('Internal server error')
        } else {
            if (!results.length) {
                resp.status(404).send('datas not found')
            } else {
        const jsonResult = JSON.parse(JSON.stringify(results));
        let workbook = new excel.Workbook(); //creating workbook
        let worksheet = workbook.addWorksheet('REF',{views: [{showGridLines: false}]}); //creating worksheet
        worksheet.columns = [
            { header: 'Motif jalon', key: 'dc_lblmotifjalonpersonnalise'},
            { header: 'Référent', key: 'dc_dernieragentreferent' },
            { header: 'Jalons dépassés', key: 'Jalons dépassés'},
            { header: `Entre ${int1[0]} et ${int1[1]} jours`, key: `Entre ${int1[0]} et ${int1[1]} jours`},
            { header: `Entre ${int2[0]} et ${int2[1]} jours`, key: `Entre ${int2[0]} et ${int2[1]} jours`},
            { header: `> ${int2[1]} jours`, key: `> ${int2[1]} jours` },
            { header: 'Total', key:'Total'}
        ];

        worksheet.columns.forEach(column => {
            column.width = column.header.length < 10 ? 10 : column.header.length + 2
          })

        
        worksheet.addRows(jsonResult);
        
        worksheet.getRow(1).eachCell((cell) => {
            cell.font = { bold: true };
          });
          for (let i =1; i<=worksheet.columns.length;i++){
          worksheet.getColumn(i).eachCell((cell) => {
            cell.border = {
                top: { style: 'thin' }, bottom: { style: 'thin' },
              };
          });
        }

        resp.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        resp.setHeader('Content-Disposition', 'attachment; filename=' + 'jalonRef.xlsx');  
        return workbook.xlsx.write(resp)
        .then(function() {
              resp.status(200).end();
        });

            }
        }


    })

})
//END

//select excel jalon ref
//http://localhost:5000/jalonxlsx/ape?
router.use('/ape', passport.authenticate('jwt', { session:  false }), (req,resp) => {
    const query = req.query;

    let fieldValue = ''
    const int1= [0,30];
    const int2= [int1[1] + 1, 60];

let sql = 'SELECT x.dc_lblmotifjalonpersonnalise, x.dc_structureprincipalede,'    
sql+=` MAX(CASE WHEN x.textnbjouravantjalon = "Sans Jalons" THEN x.nb ELSE 0 END) "Sans Jalons",`
sql+=` MAX(CASE WHEN x.textnbjouravantjalon = "Jalons dépassés" THEN x.nb ELSE 0 END) "Jalons dépassés",`
sql+=` MAX(CASE WHEN x.textnbjouravantjalon = "Entre ${int1[0]} et ${int1[1]} jours" THEN x.nb ELSE 0 END) "Entre ${int1[0]} et ${int1[1]} jours",`
sql+=` MAX(CASE WHEN x.textnbjouravantjalon = "Entre ${int2[0]} et ${int2[1]} jours" THEN x.nb ELSE 0 END) "Entre ${int2[0]} et ${int2[1]} jours",`
sql+=` MAX(CASE WHEN x.textnbjouravantjalon = "> ${int2[1]} jours" THEN x.nb ELSE 0 END) "> ${int2[1]} jours",`
sql+=` SUM(x.nb) Total`
sql+=' FROM ('

    sql += 'SELECT dc_lblmotifjalonpersonnalise, dc_structureprincipalede,'
    sql += ' CASE'
    sql += ' WHEN nbjouravantjalon < 0 THEN "Jalons dépassés"'
    sql += ` WHEN nbjouravantjalon BETWEEN ${int1[0]} AND ${int1[1]} THEN "Entre ${int1[0]} et ${int1[1]} jours"`
    sql += ` WHEN nbjouravantjalon BETWEEN ${int2[0]} AND ${int2[1]} THEN "Entre ${int2[0]} et ${int2[1]} jours"`
    sql += ` WHEN nbjouravantjalon > ${int2[1]} THEN "> ${int2[1]} jours"`
    sql += ' ELSE "jalons"'
    sql += ' END AS textnbjouravantjalon,'
    sql += ' COUNT(dc_individu_local) AS nb'
    sql += ' FROM T_Portefeuille INNER JOIN APE ON T_Portefeuille.dc_structureprincipalede = APE.id_ape'
    sql += ' WHERE dc_situationde = 2 AND nbjouravantjalon IS NOT NULL' 

    //DR Admin
     //http://localhost:3000/jalons

    //Conseiller
     //http://localhost:3000/jalons?dc_dernieragentreferent=P000617
    if (req.query.dc_dernieragentreferent) {
        fieldValue = req.query.dc_dernieragentreferent;
        sql += ' AND dc_dernieragentreferent = ? '
      }
    //ELP
     //http://localhost:3000/jalons?dc_structureprincipalede=97801  
    if (req.query.dc_structureprincipalede) {
        fieldValue = req.query.dc_structureprincipalede;
        sql += ' AND dc_structureprincipalede = ? '
      }
      //DTNE-DTSO
     //http://localhost:3000/jalons?dt=DTNE  
    if (req.query.dt) {
        fieldValue = req.query.dt;
        sql += ' AND  dt = ? '
      }
   
    sql += ' GROUP BY dc_lblmotifjalonpersonnalise, dc_structureprincipalede, textnbjouravantjalon) x'
    sql += ' GROUP BY x.dc_lblmotifjalonpersonnalise, x.dc_structureprincipalede'

    // console.log(sql)
    connection.query(sql, [fieldValue], (err, results) => {
        if (err) {
            resp.status(500).send('Internal server error')
        } else {
            if (!results.length) {
                resp.status(404).send('datas not found')
            } else {
        const jsonResult = JSON.parse(JSON.stringify(results));
        let workbook = new excel.Workbook(); //creating workbook
        let worksheet = workbook.addWorksheet('APE',{views: [{showGridLines: false}]}); //creating worksheet
        worksheet.columns = [
            { header: 'Motif jalon', key: 'dc_lblmotifjalonpersonnalise'},
            { header: 'APE', key: 'dc_structureprincipalede' },
            { header: 'Jalons dépassés', key: 'Jalons dépassés'},
            { header: `Entre ${int1[0]} et ${int1[1]} jours`, key: `Entre ${int1[0]} et ${int1[1]} jours`},
            { header: `Entre ${int2[0]} et ${int2[1]} jours`, key: `Entre ${int2[0]} et ${int2[1]} jours`},
            { header: `> ${int2[1]} jours`, key: `> ${int2[1]} jours` },
            { header: 'Total', key:'Total'}
        ];

        worksheet.columns.forEach(column => {
            column.width = column.header.length < 10 ? 10 : column.header.length + 2
          })

        
        worksheet.addRows(jsonResult);
        
        worksheet.getRow(1).eachCell((cell) => {
            cell.font = { bold: true };
          });
          for (let i =1; i<=worksheet.columns.length;i++){
          worksheet.getColumn(i).eachCell((cell) => {
            cell.border = {
                top: { style: 'thin' }, bottom: { style: 'thin' },
              };
          });
        }
        resp.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        resp.setHeader('Content-Disposition', 'attachment; filename=' + 'jalonRef.xlsx');  
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