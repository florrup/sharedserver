var express = require('express');
var router = express.Router();

const Sequelize = require('sequelize');
var Server = require('../models/server.js');

var Verify = require('./verify');

// CREATE TABLE servers(id VARCHAR(10) PRIMARY KEY, _ref VARCHAR(40), createdBy INT, createdTime VARCHAR(40), name VARCHAR(40), lastConnection INT);


/**
 * Test method to empty the servers database and create a dummy app server in order to make further tests
 * This method is available only when the ENVIRONMENT is set as 'development'
 * 
 * PRE: process.env.ENV_NODE has 'development' value
 */
router.get('/initAndWriteDummyServer', function(request, response) {
  // Test code: dummy register and table initialization:
  // force: true will drop the table if it already exists
  if (process.env.NODE_ENV === 'development'){
	  Server.sync({force: true}).then(() => {
		// Table created
		return Server.create({
		id: 0,
		username: 'myDummyAppServer',
		password: 'aaa',
		_ref: 'abc',
		createdBy: 66,
		createdTime: 'abc',
		name: 'DummyServer',
		lastConnection: 2
		})
	  })
  }
	else {
		return response.status(500).json({code: 0, message: "Incorrect environment to use testing exclusive methods"});
	}
})

/**
 *  Devuelve toda la información acerca de todos los application servers indicados.
 *
 */
router.get('/', Verify.verifyToken, Verify.verifyUserRole, function(request, response) {
  Server.findAll({
    attributes: ['id', 'username', 'password', '_ref', 'createdBy', 'createdTime', 'name', 'lastConnection']
  }).then(servers => {
    if (!servers) {
      return response.status(500).json({code: 0, message: "Unexpected error"});
    }
    return response.status(200).json(servers);
  })
});

/**
 *  Da de alta un server.
 *
 */
router.post('/', Verify.verifyToken, Verify.verifyManagerRole, function(request, response) {
  Server.create({
    id: request.body.id,
    _ref: request.body._ref,
    createdBy: request.body.createdBy,
    createdTime: request.body.createdTime,
    name: request.body.name,
    lastConnection: request.body.lastConnection,
    username: request.body.username,
    password: request.body.password
  }).then(server => {
    if (!server) {
      return response.status(500).json({code: 0, message: "Unexpected error"});
    }
    response.status(201).json(server);
  });
});

/**
 *  Modifica los datos de un servidor.
 *
 */
router.put('/:serverId', Verify.verifyToken, Verify.verifyManagerRole, function(request, response) {
  Server.find({
    where: {
      id: request.params.serverId
    }
  }).then(server => {
    if (server) {
      server.updateAttributes({
        id: request.body.id,
        _ref: request.body._ref,
        name: request.body.name,
        createdBy: request.body.createdBy,
        createdTime: request.body.createdTime,
        name: request.body.name,
        lastConnection: request.body.lastConnection,
		username: request.body.username,
		password: request.body.password
      }).then(updatedServer => {
        return response.status(200).json(updatedServer);
      });
    } else {
      return response.status(500).json({code: 0, message: "Unexpected error"});
    }
  });
});

/**
 *  Da de baja un servidor.
 *
 */
router.delete('/:serverId', Verify.verifyToken, Verify.verifyManagerRole, function(request, response) {
  Server.destroy({
    where: {
      id: request.params.serverId
    }
  }).then(server => {
    if (!server) {
      return response.status(500).json({code: 0, message: "Unexpected error"});
    }

    Server.findAll({ // must return all servers
      attributes: ['id', '_ref', 'createdBy', 'createdTime', 'name', 'lastConnection', 'username', 'password']
    })
    .then(servers => {
      if (!servers) {
        return response.status(500).json({code: 0, message: "Unexpected error"});
      }
      return response.status(204).json(servers);
    });
  });
});

/**
 *  Devuelve toda la información del servidor.
 *
 */
router.get('/:serverId', Verify.verifyToken, Verify.verifyUserRole, function(request, response) {
  Server.find({
    where: {
      id: request.params.serverId
    }
  }).then(server => {
    if (!server) {
      return response.status(500).json({code: 0, message: "Unexpected error"});
    }
    return response.status(200).json(server);
  });
});


/**
 *  Endpoint para resetear el token. Debe invalidar el anterior.
 *
 */
router.post('/:serverId', Verify.verifyToken, Verify.verifyManagerRole, function(request, response) {
});

/**
 * Endpoint que utiliza un servidor para dar señales de vida. 
 * Esto tambien se usa para renovar el token de acceso. 
 * El token devuelto podría ser el mismo que el enviado, pero si difieren, el anterior debería ser invalidado.
 *
 */
router.post('/ping', Verify.verifyToken, Verify.verifyAppRole, function(request, response) {
});

module.exports = router;


/**
 *  Method that verifies if a username has a server associated with it.
 * 
 * This method is useful to avoid application users take a username that already has a server associated to it, wich is forbidden
 */
function usernameExists(businessUserUsername, callback) {
  Server.find({
    where: {
      username: businessUserUsername
    }
  }).then(server => {
    if (!server) {
      console.log("No server has this username");
      return callback(false); 
    }
    console.log("A server has this username");
    return callback(true);
  });
}

module.exports.usernameExists = usernameExists;


/**
 *  This method clears the servers database, leaving blank the servers table
 */
function clearServersTable(){
	return new Promise(
	  function (resolve, reject) {
		Server.destroy({
		where: {},
		truncate: true
		})
		.then(affectedRows => {
		  if (affectedRows == 0) {
			// database was already empty
		  }
		  resolve(true);
		})
		// .catch(reject(false));
	});
}

module.exports.clearServersTable = clearServersTable;