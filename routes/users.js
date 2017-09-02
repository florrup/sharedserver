var express = require('express');
var router = express.Router();

// ver que con Postman funciona el get y post
// hay que pasar la conexión a la db acá y modificar estos métodos

global.users =  [
	{
		id:1,
		name: 'flor',
		surname: 'rup'
	}
];

// returns all the users
router.get('/', function(request, response) {
	return response.json({
		users: global.users,
		error: false
	});
});

// adds a new user
router.post('/', function(request, response) {
	if (!request.body.name) {
		return response.json({
			message: 'User name missing',
			error: true
		});
	}
	global.users.push(request.body);
	return response.json({
		message: 'Successfully pushed user',
		error: false
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