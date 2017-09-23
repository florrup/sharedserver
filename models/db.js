// Sequelize Module: Instantiation and connection to Database 
var pg = require('pg');
const Sequelize = require('sequelize'); // class: starts with mayus S

//DB CONNECTION: instance (starts with minus s)
// const sequelize = new Sequelize('d2gv0cr5bou448', 'yvnmgtvwznipcx', 'd2158d028efa41843d2788c28396c02b4bb47b9e2b0c207ad99f1c1dc266466e', {
const sequelize = new Sequelize(process.env.DATABASE, process.env.DATABASE_USER, process.env.DATABASE_PASS, {
  host: process.env.DATABASE_HOST,
  port: '5432',
  dialect: 'postgres',
  // freezeTableName: true, //prevent sequelize from pluralizing table names
  pool: {
    max: 5,
    min: 0,
    idle: 10000
  },
  dialectOptions: {
    ssl: true
  }
});

sequelize.authenticate()
    .then(function(err) {
        if (err) {
            // Error logging into the Database
            console.log('Unable to connect to the PostgreSQL database:', err);
        } else {
            // Databese connection successful
            console.log('Sequelize Module: Connection to Database has been established successfully.');
        }
    })

module.exports.sequelize = sequelize;