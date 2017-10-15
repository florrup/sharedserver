//! @file business-users.js
//! Describes endpoints for business-users

var express = require('express');
var router = express.Router();

const Sequelize = require('sequelize');
//var BusinessUser = require('../models/businessuser.js');
var Server = require('../routes/servers.js');
var api = require('./api.js');

var models = require('../models/db'); // loads db.js
var BusinessUser = models.businessuser;       // the model keyed by its name

//const BusinessUser = require('../models/db').BusinessUser;

var Verify = require('./verify');

// CREATE TABLE businessusers(id INT PRIMARY KEY, _ref VARCHAR(20), username VARCHAR(40), password VARCHAR(40), name VARCHAR(40), surname VARCHAR(40));


/**
 * Test method to empty the business users database and create a dummy business user in order to make further tests
 * This method is available only when the ENVIRONMENT is set as 'development'
 * 
 * PRE: process.env.ENV_NODE has 'development' value
 */
router.get('/initAndWriteDummyBusinessUser', function(request, response) {
	// Test code: dummy register and table initialization:
	// force: true will drop the table if it already exists
	// It is only available in development environment
	if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test'){
		BusinessUser.sync({force: true}).then(() => {
		  // Table created
		  
		  var dummyBusinessUser = {
			id: 0,
			username: 'johnny',
			password: 'aaa',
			name: 'John',
			surname: 'Hancock',
			roles: ['admin', 'manager', 'user']
		  };
		  BusinessUser.create(dummyBusinessUser)
		  .then(() => {
			return response.status(200).json(dummyBusinessUser);
		  })
		  .catch(error => {
			  return response.status(500).json({code: 0, message: "Unexpected error while trying to create new dummy user for testing."});
			// mhhh, wth!
		  })
		  
		})
	}
	else {
		return response.status(500).json({code: 0, message: "Incorrect environment to use testing exclusive methods"});
	}
});

/**
 *  Devuelve toda la información acerca de los usuarios de negocio indicados.
 *
 */ 
router.get('/', Verify.verifyToken, Verify.verifyAdminRole, function(request, response) {
	BusinessUser.findAll({
		attributes: ['id', '_ref', 'username', 'password', 'name', 'surname', 'roles']
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
router.post('/', Verify.verifyToken, Verify.verifyAdminRole, function(request, response) {
	BusinessUser.create({
		id: request.body.id,
		username: request.body.username,
		password: request.body.password,
		name: request.body.name,
		surname: request.body.surname,
		roles: request.body.roles
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
router.delete('/:businessuserId', Verify.verifyToken, Verify.verifyAdminRole, function(request, response) {
  BusinessUser.destroy({
    where: {
      id: request.params.businessuserId
    }
  }).then(affectedRows => {
    if (affectedRows == 0) {
      return response.status(500).json({code: 0, message: "Unexpected error: didn't find target user"});
    }

    BusinessUser.findAll({ // must return all businessusers
		attributes: ['id', '_ref', 'username', 'password', 'name', 'surname', 'roles']
    })
    .then(businessusers => {
      if (!businessusers) {
        return response.status(500).json({code: 0, message: "Unexpected error"});
      }
      return response.status(204).json(businessusers);
    });
  });
});

/**
 *  Modifica los datos de un usuario de negocio.
 *
 */
router.put('/:businessuserId', Verify.verifyToken, Verify.verifyAdminRole, function(request, response) {
  BusinessUser.find({
    where: {
      id: request.params.businessuserId
    }
  }).then(businessuser => {
    if (businessuser) {
      businessuser.updateAttributes({
        username: request.body.username,
        name: request.body.name,
        surname: request.body.surname,
        country: request.body.country,
        email: request.body.email,
        birthdate: request.body.birthdate
      }).then(updatedUser => {
        return response.status(200).json(updatedUser);
      });
    } else {
      return response.status(404).json({code: 0, message: "No existe el recurso solicitado"});
    }
  }).catch(function (error) {
    return response.status(500).json({code: 0, message: "Unexpected error"});
  });
});

router.get('/me', Verify.verifyToken, Verify.verifyUserRole, function(request, response) {
	var username = req.decoded.username;
	BusinessUser.find({
		where: {
		username: username
		}
	}).then(businessuser => {
		if (businessuser) {
			return response.status(200).json({"metadata":{"version":api.apiVersion}, "businessUser":businessuser});
		}
		else{
			return response.status(404).json({code: 0, message: "No existe el recurso solicitado"});
		}
	});
});

router.put('/me', Verify.verifyToken, Verify.verifyUserRole, function(request, response) {
	var username = req.decoded.username;
	BusinessUser.find({
		where: {
		username: username
		}
	}).then(businessuser => {
		if (businessuser) {
			// we don't update roles here
			businessuser.updateAttributes({
				username: request.body.username,
				name: request.body.name,
				surname: request.body.surname,
				country: request.body.country,
				email: request.body.email,
				birthdate: request.body.birthdate
			}).then(updatedUser => {
				return response.status(200).json(updatedUser);
			  })
			  .catch(error => {
				return response.status(500).json({code: 0, message: "Unexpected error while trying to update business user by itself (/me)."});
				// mhhh, wth!
			  })
		}
		else{
			return response.status(404).json({code: 0, message: "No existe el recurso solicitado"});
		}
	});
});

module.exports = router;

/**
 * Method to clean the business users table
**/
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
	}).catch(function () {
		console.log("Promise Rejected");
	});;
}

module.exports.clearBusinessUsersTable = clearBusinessUsersTable;