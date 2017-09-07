var express = require('express');
var router = express.Router();
var pg = require('pg');
pg.defaults.ssl = true;

/**
 *  Conecta a la base de datos y crea la tabla 'users' de ser necesario.
 *
 */
pg.connect(process.env.DATABASE_URL, function(err, client, done) {
  const query = client.query('CREATE TABLE IF NOT EXISTS users(id INT PRIMARY KEY, name VARCHAR(40) not null, surname VARCHAR(40) not null, complete BOOLEAN)');
    query.on('end', () => { client.end(); });
}); 

/**
 *  Devuelve toda la información acerca de todos los users indicados.
 *
 */
router.get('/', function(request, response) {
  const results = [];
  // Get a Postgres client from the connection pool
    pg.connect(process.env.DATABASE_URL, function(err, client, done) {

    // Handle connection errors
    if (err) {
      done();
      console.log(err);
      return response.status(500).json({success: false, message: "Unexpected error"});
    }

    // SQL Query > Select Data
    const query = client.query('SELECT * FROM users ORDER BY id ASC;');
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
 *  Da de alta un usuario.
 *
 */
router.post('/', function(request, response) {
  const results = [];
  // Grab data from http request
  const data = {id: request.body.id, name: request.body.name, surname: request.body.surname, complete: false};

  // Get a Postgres client from the connection pool
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    console.log("Connected to db from router.post in users.js");

    // Handle connection errors
    if (err) {
      done();
      console.log(err);
      return response.status(500).json({success: false, message: "Unexpected error"});
    }

    // SQL Query > Insert Data
    client.query('INSERT INTO users(id, name, surname, complete) values($1, $2, $3, $4)',
    [data.id, data.name, data.surname, data.complete]);

    // SQL Query > Select Data
    const query = client.query('SELECT * FROM users ORDER BY id ASC');
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


  


// edits an existing user
router.put('/:userid', function(request, response) {

});

// deletes a user
router.delete('/:userid', function(request, response) {

});

// gets a user
router.get('/:userid', function(request, response) {

});

// always return router
module.exports = router;