//! @file servers.js
//! Describes endpoints for servers

var express = require('express');
var router = express.Router();
// var router = express();

const Sequelize = require('sequelize');
var Server = require('../models/server.js');

var Verify = require('./verify');
var api = require('./api');

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
		
		var dummyServer = {
		id: 0,
		username: 'myDummyAppServer',
		password: 'aaa',
		_ref: 'abc',
		createdBy: 66,
		createdTime: 'abc',
		name: 'DummyServer',
		lastConnection: 2
		};
		
		Server.create(dummyServer)
		.then(() => {
			
			var payload = {
				username: dummyServer.username,
				userOk: false,
				appOk: true,
				managerOk: false,
				adminOk: false
			};
			var token = Verify.getToken(payload);
			var responseJson = {
				server: dummyServer,
				serverToken: token
			}
			return response.status(200).json(responseJson);
		  })
		  .catch(error => {
			  return response.status(500).json({code: 0, message: "Unexpected error while trying to create new dummy server for testing."});
			// mhhh, wth!
		  });
	  })
	}
	else {
		return response.status(500).json({code: 0, message: "Incorrect environment to use testing exclusive methods"});
	}
});

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
	else{
		// Now we generate and return a new fresh token with full lifetime length from now
		var payload = {
			 username: request.decoded.username,
			 userOk: request.decoded.userOk,
			 appOk: request.decoded.appOk, // normally it would be false to business users
			 managerOk: request.decoded.managerOk,
			 adminOk: request.decoded.adminOk
		};
		var newToken = Verify.getToken(payload);
		jsonInResponse = {
			metadata: {version: api.apiVersion},
			server:{
				id: server.id,
				_ref: '',
				createdBy: request.body.createdBy,
				createdTime: (new Date).getTime(),
				name: request.body.name,
				lastConnection: 0
			},
			token: {
				expiresAt: (new Date).getTime() + process.env.TOKEN_LIFETIME_IN_SECONDS * 1000,
				token: newToken
			}
		};
		return response.status(201).json(jsonInResponse);
	}
  });
});

/**
 * Endpoint que utiliza un servidor para dar señales de vida. 
 * Esto tambien se usa para renovar el token de acceso. 
 * El token devuelto podría ser el mismo que el enviado, pero si difieren, el anterior debería ser invalidado.
 *
 */
router.post('/ping', Verify.verifyToken, Verify.verifyAppRole, function(request, response) {
	Server.findOne({
		where: {
		  username: request.decoded.username
		}
	}).then(server => {
		if (server) {
			// First we add the incoming token to invalid token list
			// This method also eliminates expired tokens
			var oldToken = request.body.token || request.query.token || request.headers[process.env.TOKEN_HEADER_FLAG];

			// Now we generate and return a new fresh token with full lifetime length from now
			var payload = {
				 username: request.decoded.username,
				 userOk: request.decoded.userOk,
				 appOk: request.decoded.appOk, // normally it would be false to business users
				 managerOk: request.decoded.managerOk,
				 adminOk: request.decoded.adminOk
			};
			var newToken = Verify.getToken(payload);
			
			if (newToken != oldToken){
				// elemntal!! We only invalidate token if newToken is different from oldToken...
				Verify.invalidateToken(oldToken);
			}
			
			response.writeHead(200, {"Content-Type": "application/json"});
			var responseJson = JSON.stringify({
				metadata: {version: api.apiVersion},
				ping: {
					server: {
						id: server.Id,
						_ref: server._ref,
						createdBy: server.createdBy,
						createdTime: server.createdTime,
						name: server.name,
						lastConnection: server.lastConnection
					},
					token: {
						expiresAt: (new Date).getTime() + process.env.TOKEN_LIFETIME_IN_SECONDS * 1000,
						token: newToken
					}
				}
			});
			return response.end(responseJson);
		}
		else{
			return response.status(500).json({code: 0, message: "Username does not exist"});
		}
	}).catch(function (error) {
		return response.status(500).json({code: 0, message: "Unexpected error at PING: username not found. Error: "+error});
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
        return response.status(200).json(updatedServer); // TODO Cuidado que esto devuelve solo el id del server
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
      return response.status(404).json({code: 0, message: "Unexpected error"});
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
	return response.status(500).json({code: 0, message: "Method POST /servers/:serverId NOT YET IMPLEMENTED"});;
});

module.exports = router;

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