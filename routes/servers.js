var express = require('express');
var router = express.Router();
var pg = require('pg');
pg.defaults.ssl = true;

const Pool = require('pg').Pool;

const pool = new Pool({
  user: process.env.USER,
  host: process.env.HOST,
  database: process.env.DATABASE,
  password: process.env.PASS,
  port: 5432,
} || process.env.DATABASE_URL);

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
 *  Devuelve toda la información acerca de todos los application servers indicados.
 *
 */
router.get('/', function(request, response) {
  const results = [];

  pool.connect((err, client, release) => {

    if (err) {
      console.log(err);
      return response.status(500).json({code: 0, message: "Unexpected error"});
    }

    client.query('SELECT * FROM servers ORDER BY id ASC;', (err, result) => {
      release();
      if (err) {
        console.log(err);
        return response.status(500).json({code: 0, message: "Unexpected error"});
      }
      results.push(result.rows);
      console.log(result.rows);
      return response.status(200).json(results);
    });
  });
});

/**
 *  Da de alta un server.
 *
 */
router.post('/', function(request, response) {
  const results = [];

  const serverId = request.body.id;

  // Grab data from http request
  const data = {id: request.body.id, createdBy: request.body.createdBy, name: request.body.name};

  pool.connect((err, client, release) => {

    if (err) {
      console.log(err);
      return response.status(500).json({code: 0, message: "Unexpected error"});
    }

    client.query('INSERT INTO servers(id, createdBy, name) values($1, $2, $3)',
    [data.id, data.createdBy, data.name], (err, result) => {
      release();
      if (err) {
        console.log(err);
        return response.status(500).json({code: 0, message: "Unexpected error"});
      }
    });

    client.query('SELECT * FROM servers WHERE id=($1)', [serverId], (err, result) => {
      release();
      if (err) {
        console.log(err);
        return response.status(500).json({code: 0, message: "Unexpected error"});
      }
      results.push(result.rows);
      console.log(result.rows);
      return response.status(201).json(results);
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

  pool.connect((err, client, release) => {

    if (err) {
      console.log(err);
      return response.status(500).json({code: 0, message: "Unexpected error"});
    }

    client.query('UPDATE servers SET createdBy=($1), name=($2) WHERE id=($3)',
    [data.createdBy, data.name, serverId], (err, result) => {
      release();
      if (err) {
        console.log(err);
        return response.status(500).json({code: 0, message: "Unexpected error"});
      }
    });

    client.query('SELECT * FROM servers WHERE id=($1)', [serverId], (err, result) => {
      release();
      if (err) {
        console.log(err);
        return response.status(500).json({code: 0, message: "Unexpected error"});
      }
      results.push(result.rows);
      console.log(result.rows);
      return response.status(200).json(results);
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

  pool.connect((err, client, release) => {

    if (err) {
      console.log(err);
      return response.status(500).json({code: 0, message: "Unexpected error"});
    }

    client.query('DELETE FROM servers WHERE id=($1)', [serverId], (err, result) => {
      release();
      if (err) {
        console.log(err);
        return response.status(500).json({code: 0, message: "Unexpected error"});
      }
      results.push(result.rows);
      console.log(result.rows);
      return response.status(204).json(results);
    });
  });
});

/**
 *  Devuelve toda la información del servidor.
 *
 */
router.get('/:serverId', function(request, response) {
  const results = [];

  // Grab data from the URL parameters
  const serverId = request.params.serverId;

  pool.connect((err, client, release) => {

    if (err) {
      console.log(err);
      return response.status(500).json({code: 0, message: "Unexpected error"});
    }
    client.query('SELECT * FROM servers WHERE id=($1)', [serverId], (err, result) => {
      release();
      if (err) {
        console.log(err);
        return response.status(500).json({code: 0, message: "Unexpected error"});
      }
      results.push(result.rows);
      console.log(result.rows);
      return response.status(200).json(results);
    });
  });
});

function clearServersTable() {
  pool.connect((err, client, release) => {

    if (err) {
      console.log(err);
      return response.status(500).json({code: 0, message: "Unexpected error"});
    }
    client.query('DELETE FROM servers;', (err, result) => {
      release();
      if (err) {
        console.log(err);
        return response.status(500).json({code: 0, message: "Unexpected error"});
      }
    });
  });
}

// always return router
module.exports = router;
module.exports.clearServersTable = clearServersTable;