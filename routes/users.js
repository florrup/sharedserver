//! @file users.js
//! Describes endpoints for users

var express = require('express');
var router = express.Router();

const Sequelize = require('sequelize');

var models = require('../models/db'); // loads db.js
var User = models.user;
var Car = models.car;

var Verify = require('./verify');
var api = require('./api');

// CREATE TABLE users(id INT PRIMARY KEY, _ref VARCHAR(20), applicationowner VARCHAR(20), type VARCHAR(20), username VARCHAR(40), password VARCHAR(40), name VARCHAR(40), surname VARCHAR(40), country VARCHAR(40), email VARCHAR(40), birthdate VARCHAR(20));

/**
 * Test method to empty the users database and create a dummy user in order to make further tests
 * This method is available only when the ENVIRONMENT is set as 'development'
 * 
 * PRE: process.env.ENV_NODE has 'development' value
 */
router.get('/initAndWriteDummyUser', function(request, response) {
	// Test code: dummy register and table initialization:
	// force: true will drop the table if it already exists
	if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test'){
		User.sync({force: true}).then(() => {
		  // Table created

      var dummyUser = {
        id: 0,
        _ref: 'aaa',
        applicationowner: 'hi',
        type: 'conductor',
        username: 'johnny',
        password: 'aaa',
        name: 'John',
        surname: 'Hancock',
        country: 'Argentina',
        email: 'johnny123@gmail.com',
        birthdate: '24/05/1992'
      };
		  User.create(dummyUser)
      .then(() => {
        return response.status(200).json(dummyUser);
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
 *  Devuelve toda la información acerca de todos los users indicados.
 *
 */ 
router.get('/', Verify.verifyToken, Verify.verifyUserOrAppRole, function(request, response) {
	User.findAll({
    attributes: ['id', 'username', 'name', 'surname', 'country', 'email', 'birthdate']
  }, { include: [ Car ]
  }).then(users => {
    /* istanbul ignore if  */
    if (!users) {
      return response.status(500).json({code: 0, message: "Unexpected error"});
    }
    console.log(users.car + '\n\n\n');
		return response.status(200).json(users);
	})
});

/**
 *  Da de alta un usuario.
 *
 */
router.post('/', Verify.verifyToken, Verify.verifyAppRole, function(request, response) {
  User.create({
    id: request.body.id, // TODO esto debería generarse automáticamente por la bd
    _ref: request.body._ref,
    type: request.body.type,
    username: request.body.username,
    password: request.body.password,
    name: request.body.firstName,
    surname: request.body.lastName,
    country: request.body.country,
    email: request.body.email,
    birthdate: request.body.birthdate
  }).then(user => {
    /* istanbul ignore if  */
    if (!user) {
      return response.status(500).json({code: 0, message: "Unexpected error"});
    }
    return response.status(201).json(user);
  });
});

/**
 *  Valida las credenciales de un usuario de aplicación.   
 *
 */
router.post('/validate', Verify.verifyToken, Verify.verifyAppRole, function(request, response) {
  User.find({
    where: {
      username: request.body.username,
      password: request.body.password // TODO add facebookAuthToken
    }
  }).then(userFound => {
    if (!userFound) {
      return response.status(400).json({code: 0, message: "Faltan parámetros o validación fallida"});
    }

    var jsonInResponse = {
      metadata: {
        version: api.apiVersion
      },
      user: {
        id: userFound.id,
        _ref: userFound._ref,
        applicationowner: userFound.applicationowner,
        type: userFound.type,
        username: userFound.username,
        name: userFound.name,
        surname: userFound.surname,
        country: userFound.country,
        email: userFound.email,
        birthdate: userFound.birthdate
      }
    };
    return response.status(200).json(jsonInResponse);
  }).catch(function (error) {
    /* istanbul ignore next  */
    return response.status(500).json({code: 0, message: "Unexpected error"});
  });

});

/**
 *  Da de baja un usuario.
 *
 */
router.delete('/:userId', Verify.verifyToken, Verify.verifyManagerOrAppRole, function(request, response) {
  User.destroy({
    where: {
      id: request.params.userId
    }
  }).then(affectedRows => {
    if (affectedRows == 0) {
      return response.status(404).json({code: 0, message: "No existe el recurso solicitado"});
    }
    return response.status(204).json({});
  }).catch(function (error) {
    /* istanbul ignore next  */
    return response.status(500).json({code: 0, message: "Unexpected error"});
  });
});

/**
 *  Devuelve toda la información del usuario.
 *
 */
router.get('/:userId', Verify.verifyToken, Verify.verifyUserOrAppRole, function(request, response) {
  User.find({
    where: {
      id: request.params.userId
    }
  }).then(user => {
    if (!user) {
      return response.status(404).json({code: 0, message: "User inexistente"});
    }

    return response.status(200).json(user);
  }).catch(function (error) {
    /* istanbul ignore next  */
    return response.status(500).json({code: 0, message: "Unexpected error"});
  });
});

/**
 *  Modifica los datos de un usuario.
 *
 */
router.put('/:userId', Verify.verifyToken, Verify.verifyAppRole, function(request, response) {
  User.find({
    where: {
      id: request.params.userId
    }
  }).then(user => {
    if (user) {
      user.updateAttributes({
        _ref: request.body._ref,
        applicationowner: request.body.applicationowner,
        type: request.body.type,
        username: request.body.username,
        password: request.body.password,
        name: request.body.firstName,
        surname: request.body.lastName,
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
    /* istanbul ignore next  */
    return response.status(500).json({code: 0, message: "Unexpected error"});
  });
});

//CREATE TABLE cars(id INT PRIMARY KEY, _ref VARCHAR(20), owner VARCHAR(40), properties jsonb[]);

/**
 *  Devuelve toda la información acerca de todos los autos del usuario.
 *
 */
router.get('/:userId/cars', Verify.verifyToken, Verify.verifyUserOrAppRole, function(request, response) {
  Car.findAll({
    where: {
      owner: request.params.userId
    }
  }).then(cars => {
    console.log(cars);
    return response.status(200).json(cars); 
  }).catch(function (error) {
    return response.status(500).json({code: 0, message: "Unexpected error"});
  });
});

/**
 *  Da de alta un auto de un usuario.
 *
 */
router.post('/:userId/cars', Verify.verifyToken, Verify.verifyAppRole, function(request, response) {
  // TODO Verificar acá que cada json tenga name y value nada más, antes de meterlo a la base de datos
  Car.create({
    id: request.body.id,
    _ref: request.body._ref,
    owner: request.params.userId, // request.params.owner,
    properties: request.body.properties
  }).then(newCar => {
    if (!newCar) {
      return response.status(400).json({code: 0, message: "Incumplimiento de precondiciones"});
    }
    var jsonInResponse = {
      metadata: {
        version: api.apiVersion
      },
      car: {
        id: newCar.id,
        _ref: newCar._ref,
        owner: newCar.owner,
        properties: newCar.properties
      }
    };
    return response.status(201).json(jsonInResponse);
  }).catch(function (error) {
    /* istanbul ignore next  */
    return response.status(500).json({code: 0, message: "Unexpected error"});
  });
});

/**
 *  Da de baja un auto.
 *
 */
router.delete('/:userId/cars/:carId', Verify.verifyToken, Verify.verifyManagerOrAppRole, function(request, response) {
  Car.destroy({
    where: {
      id: request.params.carId,
      owner: request.params.userId
    }
  }).then(affectedRows => {
    if (affectedRows == 0) {
      return response.status(404).json({code: 0, message: "No existe el recurso solicitado"});
    }
    return response.status(204).json({});
  }).catch(function (error) {
    /* istanbul ignore next  */
    return response.status(500).json({code: 0, message: "Unexpected error"});
  });
});

/**
 *  Devuelve toda la información del auto.
 *
 */
router.get('/:userId/cars/:carId', Verify.verifyToken, Verify.verifyUserOrAppRole, function(request, response) {
  Car.find({
    where: {
      owner: request.params.userId,
      id: request.params.carId
    }
  }).then(carFound => {
    if (carFound) {
      var jsonInResponse = {
        metadata: {
          version: api.apiVersion
        },
        car: {
          id: carFound.id,
          _ref: carFound._ref,
          owner: carFound.owner,
          properties: carFound.properties
        }
      };
      return response.status(200).json(jsonInResponse); 
    } else {
      return response.status(404).json({code: 0, message: "Auto inexistente"});
    }
  }).catch(function (error) {
    /* istanbul ignore next  */
    return response.status(500).json({code: 0, message: "Unexpected error"});
  });
});

/**
 *  Modifica los datos del auto.
 *
 */
router.put('/:userId/cars/:carId', Verify.verifyToken, Verify.verifyAppRole, function(request, response) {
  Car.find({
    where: {
      owner: request.params.userId,
      id: request.params.carId
    }
  }).then(carFound => {
    if (carFound) {
      carFound.updateAttributes({
        _ref: request.body._ref,
        owner: request.body.owner,
        properties: request.body.properties
      }).then(updatedCar => {

        var jsonInResponse = {
          metadata: {
            version: api.apiVersion
          },
          car: {
            id: updatedCar.id,
            _ref: updatedCar._ref,
            owner: updatedCar.owner,
            properties: updatedCar.properties
          }
        };
        return response.status(200).json(jsonInResponse);
      });
    } else {
      return response.status(404).json({code: 0, message: "No existe el recurso solicitado"});
    }
  }).catch(function (error) {
    return response.status(500).json({code: 0, message: "Unexpected error"});
  });
});


module.exports = router;

/**
 *  This method clears the application users database, leaving blank the servers table
 */
function clearUsersTable(){
	return new Promise(
		function (resolve, reject) {
		  User.destroy({
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
	})
};

module.exports.clearUsersTable = clearUsersTable;

/**
 *  This method clears the application users database, leaving blank the servers table
 */
function clearCarsTable(){
  return new Promise(
    function (resolve, reject) {
      Car.destroy({
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
  })
};

module.exports.clearCarsTable = clearCarsTable;