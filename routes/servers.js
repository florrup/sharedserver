var express = require('express');
var router = express.Router();

const Sequelize = require('sequelize');
var Server = require('../models/server.js');

// CREATE TABLE servers(id VARCHAR(10) PRIMARY KEY, _ref VARCHAR(40), createdBy INT, createdTime VARCHAR(40), name VARCHAR(40), lastConnection INT);

router.get('/initAndWriteDummyServer', function(request, response) {
  // Test code: dummy register and table initialization:
  // force: true will drop the table if it already exists
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
})

/**
 *  Devuelve toda la información acerca de todos los application servers indicados.
 *
 */

router.get('/', function(request, response) {
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
 
router.post('/', function(request, response) {
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

router.put('/:serverId', function(request, response) {
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

router.delete('/:serverId', function(request, response) {
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
 
router.get('/:serverId', function(request, response) {
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

module.exports = router;

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