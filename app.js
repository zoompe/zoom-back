// dotenv loads parameters (port and database config) from .env
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { check, validationResult } = require('express-validator');
const connection = require('./db');
// Here we import all of the routing files
const fonctionRouter = require('./routes/fonction.route');
const teamRouter = require('./routes/team.route');
const apeRouter = require('./routes/ape.route');
const puserRouter = require('./routes/pusers.route');
const loadRouter = require('./routes/load.route');
const jalonRouter = require('./routes/jalons.route');
const authRouter = require('./routes/auth/auth');
const countRouter = require('./routes/count.route');
const efoRouter = require('./routes/efo.route');
const LocalStrategy = require('passport-local').Strategy
const passport = require('passport')
const passportJWT = require("passport-jwt");
const bcrypt = require('bcrypt')
const  app  =  express();
const morgan = require('morgan')
const ExtractJWT = passportJWT.ExtractJwt;
const JWTStrategy = passportJWT.Strategy;

// Responsible for logging the routes
app.use(morgan('dev'));


//strategy
passport.use('local', new LocalStrategy({
  usernameField: 'idgasi',
   passwordField: 'password',
   session: false
} , function (idgasi, password, done){

  let sql= 'SELECT idgasi , name, fonction, fonction_id, team, team_id, p_user, libelle_ape, ape_id, password ' 
  sql += 'from User INNER JOIN Fonction ON User.fonction_id = Fonction.id_fonction '
  sql += 'LEFT JOIN Team ON User.team_id = Team.id_team '
  sql += 'LEFT JOIN APE ON User.ape_id = APE.id_ape '
  sql += 'WHERE idgasi = ?'
  connection.query(sql, [idgasi], function(err, result){
      // console.log(err); console.log(result);
    if (err) return done(err);
    if(!result.length){ 
        return done(null, false, {message: 'Invalid idgasi'})
       };
    if  (bcrypt.compareSync(password, result[0].password)){
      return done(null, result[0])

      } else {
          return done(null, false, {message: 'Password incorrect'})
      }
  })   
  })) 

passport.use(new JWTStrategy({ 
jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),  
secretOrKey   : 'coucou',  
},  
function (jwtPayload, done) {  
return done(null, jwtPayload);
}  
));

// Application middleware to ensure all the data received is converted to json
// app.use(express.json());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
  next();
});

// The connection.connect is responsible for checking to see if we are connecting
// to the database as expected
connection.connect((err) => {
    if (err) {
        console.log(err)
    } else {
        console.log('You are connected to the database successfully')
    }
})

//routes
// signin signup
app.use('/auth', authRouter);

//list for dropdown register and update profile
app.use('/fonctions', fonctionRouter)
app.use('/teams', teamRouter)
app.use('/apes', apeRouter)
app.use('/pusers', puserRouter)

//count navbar
app.use('/count', countRouter)

//administration load files test
app.use('/load', loadRouter)

//jalons
app.use('/jalons', jalonRouter)

//efo
app.use('/efo', efoRouter)
    
//route 'Not Found'
app.use(function(req, res, next) {
    var  err  =  new  Error('Not Found');
    err.status  =  404;
    next(err);
});

app.listen(process.env.PORT || 5000, (err) => {
    if (err) {
      throw new Error('Something bad happened...');
    }
  
    console.log(`Server is listening on ${process.env.PORT}`);
  });

