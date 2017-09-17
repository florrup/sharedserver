var express = require('express');
var router = express.Router();

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
 *  Devuelve toda la información acerca de todos los users indicados.
 *
 */ 

router.get('/', function(request, response) {
	User.findAll({
    attributes: ['id', 'name', 'surname', 'complete']
  }).then(users => {
    if (!users) {
      return response.status(500).json({code: 0, message: "Unexpected error"});
    }
		return response.status(200).json(users);
	})
});

/**
 *  Da de alta un usuario.
 *
 */

router.post('/', function(request, response) {
  User.create({
    id: request.body.id,
    name: request.body.name,
    surname: request.body.surname,
    complete: request.body.complete
  }).then(user => {
    if (!user) {
      return response.status(500).json({code: 0, message: "Unexpected error"});
    }
    response.status(201).json(user);
  });
});

/**
 *  Da de baja un usuario.
 *
 */

router.delete('/:userId', function(request, response) {
  User.destroy({
    where: {
      id: request.params.userId
    }
  }).then(user => {
    if (!user) {
      return response.status(500).json({code: 0, message: "Unexpected error"});
    }

    User.findAll({ // must return all users
      attributes: ['id', 'name', 'surname', 'complete']
    })
    .then(users => {
      if (!users) {
        return response.status(500).json({code: 0, message: "Unexpected error"});
      }
      return response.status(204).json(users);
    });
  });
});

/**
 *  Devuelve toda la información del usuario.
 *
 */

router.get('/:userId', function(request, response) {
  User.find({
    where: {
      id: request.params.userId
    }
  }).then(user => {
    if (!user) {
      return response.status(500).json({code: 0, message: "Unexpected error"});
    }
    return response.status(200).json(user);
  });
});

/**
 *  Modifica los datos de un usuario.
 *
 */

router.put('/:userId', function(request, response) {
  User.find({
    where: {
      id: request.params.userId
    }
  }).then(user => {
    if (user) {
      user.updateAttributes({
        id: request.body.id,
        name: request.body.name,
        surname: request.body.surname,
        complete: request.body.complete
      }).then(updatedUser => {
        return response.status(200).json(updatedUser);
      });
    } else {
      return response.status(500).json({code: 0, message: "Unexpected error"});
    }
  });
});

module.exports = router;

/*
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
module.exports.clearUsersTable = clearUsersTable;
*/