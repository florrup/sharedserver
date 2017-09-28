var express = require('express');
var router = express.Router();

const Sequelize = require('sequelize');
var BusinessUser = require('../models/businessuser.js');

// CREATE TABLE businessusers(id INT PRIMARY KEY, _ref VARCHAR(20), username VARCHAR(40), password VARCHAR(40), name VARCHAR(40), surname VARCHAR(40));

/**
 *  Devuelve toda la información acerca de los usuarios de negocio indicados.
 *
 */ 

router.get('/', function(request, response) {
	BusinessUser.findAll({
		attributes: ['id', '_ref', 'username', 'password', 'name', 'surname']
		}).then(businessusers => {
	    if (!businessusers) {
	      return response.status(500).json({code: 0, message: "Unexpected error"});
	    }
		return response.status(200).json(businessusers);
	});
});

/**
 *  Da de alta un usuario de negocio.
 *
 */

router.post('/', function(request, response) {
	BusinessUser.create({
		id: request.body.id,
		username: request.body.username,
		password: request.body.password,
		name: request.body.name,
		surname: request.body.surname
	}).then(businessuser => {
		if (!businessuser) {
		  return response.status(500).json({code: 0, message: "Unexpected error"});
		}
		response.status(201).json(businessuser);
	});
});

/**
 *  Da de baja un usuario de negocio.
 *
 */

router.delete('/:businessuserId', function(request, response) {
  BusinessUser.destroy({
    where: {
      id: request.params.businessuserId
    }
  }).then(affectedRows => {
    if (affectedRows == 0) {
      return response.status(500).json({code: 0, message: "Unexpected error: didn't find target user"});
    }

    BusinessUser.findAll({ // must return all businessusers
		attributes: ['id', '_ref', 'username', 'password', 'name', 'surname']
    })
    .then(users => {
      if (!users) {
        return response.status(500).json({code: 0, message: "Unexpected error"});
      }
      return response.status(204).json(users);
    });
  });
});

module.exports = router;

function clearBusinessUsersTable() {
	return new Promise(
	  function (resolve, reject) {
		BusinessUser.destroy({
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

module.exports.clearBusinessUsersTable = clearBusinessUsersTable;