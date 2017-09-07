var express = require('express');
var router = express.Router();
var pg = require('pg');
pg.defaults.ssl = true;

/**
 *  Conecta a la base de datos y crea la tabla 'servers' de ser necesario.
 *
 */
 /*
pg.connect(process.env.DATABASE_URL, function(err, client, done) {
  const query = client.query('CREATE TABLE IF NOT EXISTS servers(id INT PRIMARY KEY, createdBy text, name text)');
  query.on('end', () => { client.end(); });
});	
*/
// TODO: Fix deprecation warning

/**
 *  Da de alta un server.
 *
 */
router.post('/', function(request, response) {
  const results = [];
  // Grab data from http request
  const data = {id: request.body.id, createdBy: request.body.createdBy, name: request.body.text};

  // Get a Postgres client from the connection pool
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    console.log("Connected to db from router.post in servers.js");

    // Handle connection errors
    if (err) {
      done();
      console.log(err);
      return response.status(500).json({success: false, message: "Unexpected error"});
    }

    // SQL Query > Insert Data
    client.query('INSERT INTO servers(id, createdBy, name) values($1, $2, $3)',
    [data.id, data.createdBy, data.name]);

    // SQL Query > Select Data
    const query = client.query('SELECT * FROM servers ORDER BY id ASC');
    // Stream results back one row at a time
    query.on('row', (row) => {
      results.push(row);
    });

    // After all data is returned, close connection and return results
    query.on('end', () => {
      done();
      return response.json(results);
    });
  });
});

/**
 *  Modifica los datos de un servidor.
 *
 */
router.put('/:serverId', function(request, response) {
  const results = [];
  // Grab data from the URL parameters
  const serverId = request.params.serverId;
  // Grab data from http request
  const data = {id: request.body.id, createdBy: request.body.createdBy, name: request.body.name};
  // Get a Postgres client from the connection pool
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    // Handle connection errors
    if(err) {
      done();
      console.log(err);
      return response.status(500).json({success: false, message: "Unexpected error"});
    }
    // SQL Query > Update Data
    client.query('UPDATE servers SET createdBy=($1), name=($2) WHERE id=($3)',
    [data.createdBy, data.name, serverId]);
    // SQL Query > Select Data
    const query = client.query("SELECT * FROM servers ORDER BY id ASC");
    // Stream results back one row at a time
    query.on('row', (row) => {
      results.push(row);
    });
    // After all data is returned, close connection and return results
    query.on('end', function() {
      done();
      return response.json(results);
    });
  });
});

/**
 *  Da de baja un servidor.
 *
 */
router.delete('/:serverId', function(request, response) {
  const results = [];
  // Grab data from the URL parameters
  const serverId = request.params.serverId;
  // Get a Postgres client from the connection pool
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    // Handle connection errors
    if(err) {
      done();
      console.log(err);
      return response.status(500).json({success: false, data: err});
    }
    // SQL Query > Delete Data
    client.query('DELETE FROM servers WHERE id=($1)', [serverId]);
    // SQL Query > Select Data
    var query = client.query('SELECT * FROM servers ORDER BY id ASC');
    // Stream results back one row at a time
    query.on('row', (row) => {
      results.push(row);
    });
    // After all data is returned, close connection and return results
    query.on('end', () => {
      done();
      return response.json(results);
    });
  });
});

// always return router
module.exports = router;