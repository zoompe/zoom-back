const express = require('express');
const router = express.Router();
const connection = require('../db');
const passport = require('passport');
const excel = require('exceljs');


//select excel contacts ref
//http://localhost:5000/activitexlsx/contacts/ref?
router.use('/contacts/ref', passport.authenticate('jwt', { session:  false }), (req,resp) => {

    const query = req.query;

    let sql ="SELECT annee , mois , dc_agentreferent,  Sum(nb_de_affectes) AS nb_de_affectes, Sum(dem_de_trait_phys) AS GOA, Sum(dem_de_trait_tel) AS 'Tel 3949',"
    sql+= " Sum(entretien_phys) as entretien_phys, sum(entretien_tel) as entretien_tel, sum(entretien_mail) as entretien_mail, sum(entretien_dmc) as entretien_dmc, sum(mailnet_entrant) as mailnet_entrant, sum(mailnet_sortant) as mailnet_sortant,sum(contact_entrant) / sum(nb_de_affectes) as tx_contact_entrant, sum(contact_sortant) / Sum(nb_de_affectes) as tx_contact_sortant"
    sql+=" FROM T_Activites INNER JOIN APE ON T_Activites.dc_structureprincipalesuivi = APE.id_ape"
    
    let sqlValues = [];
    
    Object.keys(query).filter((key) => query[key]!=='all').map((key, index) => {
        
                if (index === 0) {
                    sql += ` WHERE ${key} = ?`
                }
                else {
                    sql += ` AND ${key} = ?`
        
                } 
            
            sqlValues.push(query[key])
        })
    
    sql+= " GROUP BY annee, mois, dc_agentreferent order by annee, mois, dc_agentreferent desc"
    
    console.log(sql)
    connection.query(sql, sqlValues, (err, results) => {
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
                    { header: 'Année', key: 'annee'},
                    { header: 'Mois', key: 'mois'},
                    { header: 'Référent', key: 'dc_agentreferent'},
                    { header: 'Nb DE affectes', key: 'nb_de_affectes'},
                    { header: 'GOA', key: 'GOA'},
                    { header: '3949', key: 'Tel 3949'},
                    { header: 'entretien phys', key: 'entretien_phys'},
                    { header: 'entretien tel', key: 'entretien_tel'},
                    { header: 'entretien mail', key: 'entretien_mail'},
                    { header: 'entretien dmc', key: 'entretien_dmc'},
                    { header: 'mailnet entrant', key: 'mailnet_entrant'},
                    { header: 'mailnet sortant', key: 'mailnet_sortant'},
                    { header: 'tx contact entrant', key: 'tx_contact_entrant'},
                    { header: 'tx contact sortant', key: 'tx_contact_sortant'}
                    
                ];
                worksheet.columns.forEach(column => {
                    column.width = column.header.length < 8 ? 8 : column.header.length + 1
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

                worksheet.getColumn(13).eachCell((cell) => {
                    cell.numFmt = '0.0%';
                  });
                  worksheet.getColumn(14).eachCell((cell) => {
                    cell.numFmt = '0.0%';
                  });
  
                resp.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                resp.setHeader('Content-Disposition', 'attachment; filename=' + 'contactREF.xlsx');  
                return workbook.xlsx.write(resp)
                .then(function() {
                      resp.status(200).end();
                });
        

                    }
                }
            })
        })
                

//END

//select excel contacts ape
//http://localhost:5000/activitexlsx/contacts/ape?
router.use('/contacts/ape', passport.authenticate('jwt', { session:  false }), (req,resp) => {

    const query = req.query;

    let sql ="SELECT annee , mois , dc_structureprincipalesuivi, Sum(nb_de_affectes) AS nb_de_affectes, Sum(dem_de_trait_phys) AS GOA, Sum(dem_de_trait_tel) AS 'Tel 3949',"
    sql+= " Sum(entretien_phys) as entretien_phys, sum(entretien_tel) as entretien_tel, sum(entretien_mail) as entretien_mail, sum(entretien_dmc) as entretien_dmc, sum(mailnet_entrant) as mailnet_entrant, sum(mailnet_sortant) as mailnet_sortant,sum(contact_entrant) / sum(nb_de_affectes) as tx_contact_entrant, sum(contact_sortant) / Sum(nb_de_affectes) as tx_contact_sortant"
    sql+=" FROM T_Activites INNER JOIN APE ON T_Activites.dc_structureprincipalesuivi = APE.id_ape"
    
    let sqlValues = [];
    
    Object.keys(query).filter((key) => query[key]!=='all').map((key, index) => {
        
                if (index === 0) {
                    sql += ` WHERE ${key} = ?`
                }
                else {
                    sql += ` AND ${key} = ?`
        
                } 
            
            sqlValues.push(query[key])
        })
    
    sql+= " GROUP BY annee, mois, dc_structureprincipalesuivi order by annee, mois, dc_structureprincipalesuivi desc"
    
    console.log(sql)
    connection.query(sql, sqlValues, (err, results) => {
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
                    { header: 'Année', key: 'annee'},
                    { header: 'Mois', key: 'mois' },
                    { header: 'APE', key: 'dc_structureprincipalesuivi'},
                    { header: 'Nb DE affectes', key: 'nb_de_affectes'},
                    { header: 'GOA', key: 'GOA'},
                    { header: '3949', key: 'Tel 3949'},
                    { header: 'entretien phys', key: 'entretien_phys'},
                    { header: 'entretien tel', key: 'entretien_tel'},
                    { header: 'entretien mail', key: 'entretien_mail'},
                    { header: 'entretien dmc', key: 'entretien_dmc'},
                    { header: 'mailnet entrant', key: 'mailnet_entrant'},
                    { header: 'mailnet sortant', key: 'mailnet_sortant'},
                    { header: 'tx contact entrant', key: 'tx_contact_entrant'},
                    { header: 'tx contact sortant', key: 'tx_contact_sortant'}
                    
                ];
                worksheet.columns.forEach(column => {
                    column.width = column.header.length < 8 ? 8 : column.header.length + 1
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

                worksheet.getColumn(13).eachCell((cell) => {
                    cell.numFmt = '0.0%';
                  });
                  worksheet.getColumn(14).eachCell((cell) => {
                    cell.numFmt = '0.0%';
                  });
                resp.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                resp.setHeader('Content-Disposition', 'attachment; filename=' + 'contactAPE.xlsx');  
                return workbook.xlsx.write(resp)
                .then(function() {
                      resp.status(200).end();
                });
        

                    }
                }
            })
        })
                

//END

//select excel presta ref
//http://localhost:5000/activitexlsx/presta/ref?
router.use('/presta/ref', passport.authenticate('jwt', { session:  false }), (req,resp) => {

    const query = req.query;

    let sql ="SELECT annee , mois , dc_agentreferent, "
    sql+= " Sum(nb_de_affectes) AS nb_de_affectes, Sum(presta_rca) AS ACTIV_Créa, Sum(presta_aem) AS ACTIV_Emploi," 
    sql += " Sum(presta_acp) AS ACTIV_Projet, Sum(presta_rgc) AS Regards_croisés, Sum(presta_vsi) AS Valoriser_son_image_pro,"
    sql += " Sum(presta_z08+presta_z10+presta_z16) AS Vers1métier, Sum(presta) AS Presta, sum(presta) / Sum(nb_de_affectes) as tx_prestation"
    sql+=" FROM T_Activites INNER JOIN APE ON T_Activites.dc_structureprincipalesuivi = APE.id_ape"
    
    let sqlValues = [];
    
    Object.keys(query).filter((key) => query[key]!=='all').map((key, index) => {
        
                if (index === 0) {
                    sql += ` WHERE ${key} = ?`
                }
                else {
                    sql += ` AND ${key} = ?`
        
                } 
            
            sqlValues.push(query[key])
        })
    
    sql+= " GROUP BY annee, mois, dc_agentreferent order by annee, mois, dc_agentreferent desc"
    
    console.log(sql)
    connection.query(sql, sqlValues, (err, results) => {
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
                    { header: 'Année', key: 'annee'},
                    { header: 'Mois', key: 'mois'},
                    { header: 'Référent', key: 'dc_agentreferent'},
                    { header: 'Nb DE affectes', key: 'nb_de_affectes'},
                    { header: 'ACTIV_Créa', key: 'ACTIV_Créa'},
                    { header: 'ACTIV_Emploi', key: 'ACTIV_Emploi'},
                    { header: 'ACTIV_Projet', key: 'ACTIV_Projet'},
                    { header: 'Regards_croisés', key: 'Regards_croisés'},
                    { header: 'Valoriser_son_image_pro', key: 'Valoriser_son_image_pro'},
                    { header: 'Vers1métier', key: 'Vers1métier'},
                    { header: 'Presta', key: 'Presta'},
                    { header: 'Tx prestation', key: 'tx_prestation'}                
                ];

                worksheet.columns.forEach(column => {
                    column.width = column.header.length < 5 ? 10 : column.header.length + 4
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

                worksheet.getColumn(12).eachCell((cell) => {
                    cell.numFmt = '0.0%';
                  });
               
  
                resp.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                resp.setHeader('Content-Disposition', 'attachment; filename=' + 'prestaREF.xlsx');  
                return workbook.xlsx.write(resp)
                .then(function() {
                      resp.status(200).end();
                });
        

                    }
                }
            })
        })
                

//END

//select excel presta ape
//http://localhost:5000/activitexlsx/presta/ape?
router.use('/presta/ape', passport.authenticate('jwt', { session:  false }), (req,resp) => {

    const query = req.query;

    let sql ="SELECT annee , mois , dc_structureprincipalesuivi, "
    sql+= " Sum(nb_de_affectes) AS nb_de_affectes, Sum(presta_rca) AS ACTIV_Créa, Sum(presta_aem) AS ACTIV_Emploi," 
    sql += " Sum(presta_acp) AS ACTIV_Projet, Sum(presta_rgc) AS Regards_croisés, Sum(presta_vsi) AS Valoriser_son_image_pro,"
    sql += " Sum(presta_z08+presta_z10+presta_z16) AS Vers1métier, Sum(presta) AS Presta, sum(presta) / Sum(nb_de_affectes) as tx_prestation"
    sql+=" FROM T_Activites INNER JOIN APE ON T_Activites.dc_structureprincipalesuivi = APE.id_ape"


    let sqlValues = [];
    
    Object.keys(query).filter((key) => query[key]!=='all').map((key, index) => {
        
                if (index === 0) {
                    sql += ` WHERE ${key} = ?`
                }
                else {
                    sql += ` AND ${key} = ?`
        
                } 
            
            sqlValues.push(query[key])
        })
    
    sql+= " GROUP BY annee, mois, dc_structureprincipalesuivi order by annee, mois, dc_structureprincipalesuivi desc"
    
    console.log(sql)
    connection.query(sql, sqlValues, (err, results) => {
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
                    { header: 'Année', key: 'annee'},
                    { header: 'Mois', key: 'mois' },
                    { header: 'APE', key: 'dc_structureprincipalesuivi'},
                    { header: 'Nb DE affectes', key: 'nb_de_affectes'},
                    { header: 'ACTIV_Créa', key: 'ACTIV_Créa'},
                    { header: 'ACTIV_Emploi', key: 'ACTIV_Emploi'},
                    { header: 'ACTIV_Projet', key: 'ACTIV_Projet'},
                    { header: 'Regards_croisés', key: 'Regards_croisés'},
                    { header: 'Valoriser_son_image_pro', key: 'Valoriser_son_image_pro'},
                    { header: 'Vers1métier', key: 'Vers1métier'},
                    { header: 'Presta', key: 'Presta'},
                    { header: 'Tx prestation', key: 'tx_prestation'} 
                    
                ];
                worksheet.columns.forEach(column => {
                    column.width = column.header.length < 5 ? 10 : column.header.length + 4
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

                worksheet.getColumn(12).eachCell((cell) => {
                    cell.numFmt = '0.0%';
                  });
                  
                resp.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                resp.setHeader('Content-Disposition', 'attachment; filename=' + 'prestaAPE.xlsx');  
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