const express = require('express');
const router = express.Router();
const connection = require('../db');
const passport = require('passport');
const excel = require('exceljs');


//select excel efo ref
//http://localhost:5000/activitexlsx/ref?
router.use('/ref', passport.authenticate('jwt', { session:  false }), (req,resp) => {

    const query = req.query;

    let sql ="SELECT annee , mois , dc_agentreferent,  Sum(nb_de_affectes) AS nb_de_affectes, Sum(dem_de_trait_phys) AS GOA, Sum(dem_de_trait_tel) AS 'Tel 3949',"
    sql+= " Sum(entretien_phys) as entretien_phys, sum(entretien_tel) as entretien_tel, sum(entretien_mail) as entretien_mail, sum(entretien_dmc) as entretien_dmc, sum(mailnet_entrant) as mailnet_entrant, sum(mailnet_sortant) as mailnet_sortant, CONCAT(FORMAT(sum(contact_entrant) / sum(nb_de_affectes) * 100, 1), '%') as tx_contact_entrant, CONCAT(FORMAT(sum(contact_sortant) / Sum(nb_de_affectes) * 100, 1),'%') as tx_contact_sortant"
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
                let worksheet = workbook.addWorksheet('REF'); //creating worksheet
                
                worksheet.columns = [
                    { header: 'Année', key: 'annee', width: 20 },
                    { header: 'Mois', key: 'mois', width: 10 },
                    { header: 'Référent', key: 'dc_agentreferent', width: 10 },
                    { header: 'nb_de_affectes', key: 'nb_de_affectes', width: 10},
                    { header: 'GOA', key: 'GOA', width: 10},
                    { header: '3949', key: 'Tel 3949', width: 10},
                    { header: 'entretien_phys', key: 'entretien_phys', width: 10},
                    { header: 'entretien_tel', key: 'entretien_tel', width: 10},
                    { header: 'entretien_mail', key: 'entretien_mail', width: 10},
                    { header: 'entretien_dmc', key: 'entretien_dmc', width: 10},
                    { header: 'mailnet_entrant', key: 'mailnet_entrant', width: 10},
                    { header: 'mailnet_sortant', key: 'mailnet_sortant', width: 10},
                    { header: 'tx_contact_entrant', key: 'tx_contact_entrant', width: 10},
                    { header: 'tx_contact_sortant', key: 'tx_contact_sortant', width: 10}
                    
                ];
                worksheet.addRows(jsonResult);
  
                resp.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                resp.setHeader('Content-Disposition', 'attachment; filename=' + 'activiteREF.xlsx');  
                return workbook.xlsx.write(resp)
                .then(function() {
                      resp.status(200).end();
                });
        

                    }
                }
            })
        })
                

//END

//select excel activite ape
//http://localhost:5000/activitexlsx/ape?
router.use('/ape', passport.authenticate('jwt', { session:  false }), (req,resp) => {

    const query = req.query;

    let sql ="SELECT annee , mois , dc_structureprincipalesuivi, dc_modalitesuiviaccomp_id, Sum(nb_de_affectes) AS nb_de_affectes, Sum(dem_de_trait_phys) AS GOA, Sum(dem_de_trait_tel) AS 'Tel 3949',"
    sql+= " Sum(entretien_phys) as entretien_phys, sum(entretien_tel) as entretien_tel, sum(entretien_mail) as entretien_mail, sum(entretien_dmc) as entretien_dmc, sum(mailnet_entrant) as mailnet_entrant, sum(mailnet_sortant) as mailnet_sortant, CONCAT(FORMAT(sum(contact_entrant) / sum(nb_de_affectes) * 100, 1), '%') as tx_contact_entrant, CONCAT(FORMAT(sum(contact_sortant) / Sum(nb_de_affectes) * 100, 1),'%') as tx_contact_sortant"
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
    
    sql+= " GROUP BY annee, mois, dc_structureprincipalesuivi, dc_modalitesuiviaccomp_id order by annee, mois, dc_structureprincipalesuivi,dc_modalitesuiviaccomp_id desc"
    
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
                let worksheet = workbook.addWorksheet('REF'); //creating worksheet
                
                worksheet.columns = [
                    { header: 'Année', key: 'annee', width: 20 },
                    { header: 'Mois', key: 'mois', width: 10 },
                    { header: 'APE', key: 'dc_structureprincipalesuivi', width: 10 },
                    { header: 'Modalité ACC', key: 'dc_modalitesuiviaccomp_id', width: 10 },
                    { header: 'nb_de_affectes', key: 'nb_de_affectes', width: 10},
                    { header: 'GOA', key: 'GOA', width: 10},
                    { header: '3949', key: 'Tel 3949', width: 10},
                    { header: 'entretien_phys', key: 'entretien_phys', width: 10},
                    { header: 'entretien_tel', key: 'entretien_tel', width: 10},
                    { header: 'entretien_mail', key: 'entretien_mail', width: 10},
                    { header: 'entretien_dmc', key: 'entretien_dmc', width: 10},
                    { header: 'mailnet_entrant', key: 'mailnet_entrant', width: 10},
                    { header: 'mailnet_sortant', key: 'mailnet_sortant', width: 10},
                    { header: 'tx_contact_entrant', key: 'tx_contact_entrant', width: 10},
                    { header: 'tx_contact_sortant', key: 'tx_contact_sortant', width: 10}
                    
                ];
                worksheet.addRows(jsonResult);
  
                resp.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                resp.setHeader('Content-Disposition', 'attachment; filename=' + 'activiteREF.xlsx');  
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