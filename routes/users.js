var express = require('express');
var router = express.Router();
var pg = require('pg');
pg.defaults.ssl = true;

/**
 *  Conecta a la base de datos y crea la tabla 'users' de ser necesario.
 *
 */
 /*
pg.connect(process.env.DATABASE_URL, function(err, client, done) {
  const query = client.query('CREATE TABLE IF NOT EXISTS users(id INT PRIMARY KEY, name VARCHAR(40) not null, surname VARCHAR(40) not null, complete BOOLEAN)');
    query.on('end', () => { client.end(); });
}); 
*/
// TODO: Fix deprecation warning

/**
 *  Devuelve toda la información acerca de todos los users indicados.
 *
 */
router.get('/', function(request, response) {
  const results = [];

  // Get a Postgres client from the connection pool
  var client = new pg.Client(process.env.DATABASE_URL);
  client.connect(function(err) {
    if(err) {
      console.log(err);
      return response.status(500).json({code: 0, message: "Unexpected error"});
    }
  });

  // SQL Query > Select Data
  var Query = require('pg').Query;
  var query = new Query('SELECT * FROM users ORDER BY id ASC;');
  var result = client.query(query);

  // Stream results back one row at a time
  query.on('row', (row) => {
    results.push(row);
  });

  // After all data is returned, close connection and return results
  query.on('end', () => {
    return response.status(200).json(results);
  });
});

/**
 *  Da de alta un usuario.
 *
 */
router.post('/', function(request, response) {
  const results = [];

  const userId = request.body.id;

  // Grab data from http request
  const data = {id: request.body.id, name: request.body.name, surname: request.body.surname, complete: false};

  // Get a Postgres client from the connection pool
  var client = new pg.Client(process.env.DATABASE_URL);
  client.connect(function(err) {
    if(err) {
      console.log(err);
      return response.status(500).json({code: 0, message: "Unexpected error"});
    }
  });

  // SQL Query > Insert Data
  var Query = require('pg').Query;
  var query = new Query('INSERT INTO users(id, name, surname, complete) values($1, $2, $3, $4)',
  	[data.id, data.name, data.surname, data.complete]);
  var result = client.query(query);

  // SQL Query > Select Data
  query = new Query('SELECT * FROM users WHERE id=($1)', [userId]);
  result = client.query(query);

  // Stream results back one row at a time
  query.on('row', (row) => {
    results.push(row);
  });

  // After all data is returned, close connection and return results
  query.on('end', () => {
    return response.status(201).json(results);
  });
});

/**
 *  Da de baja un usuario.
 *
 */
router.delete('/:userId', function(request, response) {
  const results = [];

  // Grab data from the URL parameters
  const userId = request.params.userId;

  // Get a Postgres client from the connection pool
  var client = new pg.Client(process.env.DATABASE_URL);
  client.connect(function(err) {
    if(err) {
      console.log(err);
      return response.status(500).json({code: 0, message: "Unexpected error"});
    }
  });

  // SQL Query > Delete Data
  var Query = require('pg').Query;
  var query = new Query('DELETE FROM users WHERE id=($1)', [userId]);
  var result = client.query(query);

  // SQL Query > Select Data
  query = new Query('SELECT * FROM users ORDER BY id ASC;');
  result = client.query(query);

  // Stream results back one row at a time
  query.on('row', (row) => {
    results.push(row);
  });

  // After all data is returned, close connection and return results
  query.on('end', () => {
    return response.status(204).json(results);
  });
});

/**
 *  Devuelve toda la información del usuario.
 *
 */
router.get('/:userId', function(request, response) {
  const results = [];

  // Grab data from the URL parameters
  const userId = request.params.userId;

  // Get a Postgres client from the connection pool
  var client = new pg.Client(process.env.DATABASE_URL);
  client.connect(function(err) {
    if(err) {
      console.log(err);
      return response.status(500).json({code: 0, message: "Unexpected error"});
    }
  });

  // SQL Query > Select Data
  var Query = require('pg').Query;
  var query = new Query('SELECT * FROM users WHERE id=($1)', [userId]);
  var result = client.query(query);

  // Stream results back one row at a time
  query.on('row', (row) => {
    results.push(row);
  });

  // After all data is returned, close connection and return results
  query.on('end', () => {
    return response.status(200).json(results);
  });
});

/**
 *  Modifica los datos de un usuario.
 *
 */
router.put('/:userId', function(request, response) {
  const results = [];

  // Grab data from the URL parameters
  const userId = request.params.userId;

  // Grab data from http request
  const data = {id: request.body.id, name: request.body.name, surname: request.body.surname, complete: false};

  // Get a Postgres client from the connection pool
  var client = new pg.Client(process.env.DATABASE_URL);
  client.connect(function(err) {
    if(err) {
      console.log(err);
      return response.status(500).json({success: false, message: "Unexpected error"});
    }
  });

  // SQL Query > Update Data
  var Query = require('pg').Query;
  var query = new Query('UPDATE users SET name=($1), surname=($2) WHERE id=($3)',
    [data.name, data.surname, userId]);
  var result = client.query(query);

  // SQL Query > Select Data
  query = new Query('SELECT * FROM users WHERE id=($1)', [userId]);
  result = client.query(query);

  // Stream results back one row at a time
  query.on('row', (row) => {
    results.push(row);
  });

  // After all data is returned, close connection and return results
  query.on('end', function() {
    return response.status(200).json(results);
  });
});

function clearUsersTable() {
  // Get a Postgres client from the connection pool
  var client = new pg.Client(process.env.DATABASE_URL);
  client.connect(function(err) {
    if(err) {
      console.log(err);
      return response.status(500).json({code: 0, message: "Unexpected error"});
    }
  });

  // SQL Query > Select Data
  var Query = require('pg').Query;
  var query = new Query('DELETE FROM users');
  var result = client.query(query);
/*
  // SQL Query > Select Data
  query = new Query('SELECT * FROM users');
  result = client.query(query);
  var count = 0;
  query.on('row', (row) => {
    count++;
  });
  console.log("Count is " + count);
*/
}

// always return router
module.exports = router;
module.exports.clearUsersTable = clearUsersTable;