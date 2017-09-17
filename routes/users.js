var express = require('express');
var router = express.Router();
// var pg = require('pg'); // Old code with direct DB access
// pg.defaults.ssl = true; // Old code with direct DB access

const Sequelize = require('sequelize');
var User = require('../models/user.js');

router.get('/initAndWriteDummyUser', function(request, response){
	// Test code: dummy register and table initialization:
	// force: true will drop the table if it already exists
	User.sync({force: true}).then(() => {
	  // Table created
	  return User.create({
		id: 0,
		name: 'John',
		surname: 'Hancock',
		complete: false
	  })
	})
})

/**
 * Get full users list
*/
router.get('/', function(request, response) {
	const results = [];
	User.findAll()
		.then(users => {
			console.log(users);
			results.push(users);
			console.log(results.rows);
			return response.status(201).json(results);
		})
})

module.exports = router;

// -------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------
// Old code with direct DB access:
/*
const Pool = require('pg').Pool;

const pool = new Pool({
  user: process.env.USER,
  host: process.env.HOST,
  database: process.env.DATABASE,
  password: process.env.PASS,
  port: 5432,
} || process.env.DATABASE_URL);
*/
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
/*
/**
 *  Devuelve toda la información acerca de todos los users indicados.
 *
 */ 
 /*
router.get('/', function(request, response) {
  const results = [];

  pool.connect((err, client, release) => {

    if (err) {
      console.log(err);
      return response.status(500).json({code: 0, message: "Unexpected error"});
    }

    client.query('SELECT * FROM users ORDER BY id ASC;', (err, result) => {
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
 *  Da de alta un usuario.
 *
 */
 /*
router.post('/', function(request, response) {
  const results = [];

  const userId = request.body.id;

  // Grab data from http request
  const data = {id: request.body.id, name: request.body.name, surname: request.body.surname, complete: false};

  pool.connect((err, client, release) => {

    if (err) {
      console.log(err);
      return response.status(500).json({code: 0, message: "Unexpected error"});
    }

    client.query('INSERT INTO users(id, name, surname, complete) values($1, $2, $3, $4)',
    [data.id, data.name, data.surname, data.complete], (err, result) => {
      release();
      if (err) {
        console.log(err);
        return response.status(500).json({code: 0, message: "Unexpected error"});
      }
    });

    client.query('SELECT * FROM users WHERE id=($1)', [userId], (err, result) => {
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
 *  Da de baja un usuario.
 *
 */
 /*
router.delete('/:userId', function(request, response) {
  const results = [];

  // Grab data from the URL parameters
  const userId = request.params.userId;

 pool.connect((err, client, release) => {

    if (err) {
      console.log(err);
      return response.status(500).json({code: 0, message: "Unexpected error"});
    }

    client.query('DELETE FROM users WHERE id=($1)', [userId], (err, result) => {
      release();
      if (err) {
        console.log(err);
        return response.status(500).json({code: 0, message: "Unexpected error"});
      }
    });

    client.query('SELECT * FROM users ORDER BY id ASC;', (err, result) => {
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
 *  Devuelve toda la información del usuario.
 *
 */
 /*
router.get('/:userId', function(request, response) {
  const results = [];

  // Grab data from the URL parameters
  const userId = request.params.userId;
  pool.connect((err, client, release) => {

    if (err) {
      console.log(err);
      return response.status(500).json({code: 0, message: "Unexpected error"});
    }

    client.query('SELECT * FROM users WHERE id=($1)', [userId], (err, result) => {
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
 *  Modifica los datos de un usuario.
 *
 */
 /*
router.put('/:userId', function(request, response) {
  const results = [];

  // Grab data from the URL parameters
  const userId = request.params.userId;

  // Grab data from http request
  const data = {id: request.body.id, name: request.body.name, surname: request.body.surname, complete: false};

  pool.connect((err, client, release) => {

    if (err) {
      console.log(err);
      return response.status(500).json({code: 0, message: "Unexpected error"});
    }

    client.query('UPDATE users SET name=($1), surname=($2) WHERE id=($3)',
    [data.name, data.surname, userId], (err, result) => {
      release();
      if (err) {
        console.log(err);
        return response.status(500).json({code: 0, message: "Unexpected error"});
      }
    });

    client.query('SELECT * FROM users WHERE id=($1)', [userId], (err, result) => {
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

function clearUsersTable() {
  pool.connect((err, client, release) => {

    if (err) {
      console.log(err);
      return response.status(500).json({code: 0, message: "Unexpected error"});
    }
    client.query('DELETE FROM users;', (err, result) => {
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
module.exports.clearUsersTable = clearUsersTable;
*/