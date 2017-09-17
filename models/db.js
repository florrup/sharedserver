// Sequelize Module: Instantiation and connection to Database 
var pg = require('pg');
const Sequelize = require('sequelize'); // class: starts with mayus S

//DB CONNECTION: instance (starts with minus s)
const sequelize = new Sequelize('d2gv0cr5bou448', 'yvnmgtvwznipcx', 'd2158d028efa41843d2788c28396c02b4bb47b9e2b0c207ad99f1c1dc266466e', {
  host: 'ec2-184-73-249-56.compute-1.amazonaws.com',
  port: '5432',
  dialect: 'postgres',
  pool: {
    max: 5,
    min: 0,
    idle: 10000
  },
});

sequelize.authenticate()
	.then(function(err) {
		if (err) console.log('Unable to connect to the PostgreSQL database:', err);
		console.log('Sequelize Module: Connection to Database has been established successfully.');
	});

module.exports.sequelize = sequelize;