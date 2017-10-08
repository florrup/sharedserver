var express = require('express');
var router = express.Router();
var verify = require('./verify');
var api = require('./api');

var BusinessUsers = require('../models/businessuser');
/** 
 * This endpoint creates a new token and sends it to the user if the username and password provided are valid
**/
router.post('/', function (request, response){
	var localUsername = request.body.BusinessUserCredentials.username;
	var localPassword = request.body.BusinessUserCredentials.password;
	var token_lifetime = process.env.TOKEN_LIFETIME_IN_SECONDS;
	
	BusinessUsers.find({
		where: {
			username: localUsername
		}
	})
	.then( function(businessUser){
		if (!businessUser){
			return response.status(400).json({code: 0, message: "Username does not exist in the database or missing username to get token"});
			console.log('Username wich does not exist was used to attem log in');
		}
		else {
			// console.log(businessUser);
			if (businessUser.password != localPassword){
				return response.status(401).json({code: 0, message: "Username's password is incorrect"});
				console.log('Incorrect password at user log in attemp');
			}
			else {
				console.log('User ', businessUser.username, 'logged successfully');
				var payload = {
					 username: businessUser.username
				};
				var localToken = verify.getToken(payload);
				response.writeHead(201, {"Content-Type": "application/json"});
				var responseJson = JSON.stringify({
					metadata: {version: api.apiVersion},
					token: {
						expiresAt: (new Date).getTime() + process.env.TOKEN_LIFETIME_IN_SECONDS * 1000,
						token: localToken
					}
				});
				return response.end(responseJson);
			}
		}
	});
	/*
	BusinessUsers.findAll({
	  where: {
		username: localUsername
	}})
	  .then(
		businessusers => {
			if (!businessusers) {
				return response.status(400).json({code: 0, message: "Username does not exist in the database or missing usernam to get token"});
				console.log('Username wich does not exist was used to attem log in');
			}
			else{
				console.log(businessusers);
				if (businessusers[0].password != localPassword){
					return response.status(401).json({code: 0, message: "Username's password is incorrect"});
					console.log('Incorrect password at user log in attemp');
				}
				else {
					
					console.log('User ', businessusers[0].username, 'logged successfully');
					return response.status(201).json({
						metadata: {version: api.apiVersion},
						token: {
							expiresAt: (new Date).getTime() + process.env.TOKEN_LIFETIME_IN_SECONDS * 1000,
							// token: verify.getToken(businessUsers[0])
						}
					});
				}
			}
		}
	  )*/
	  /*
	.catch(function(error) {
		// defer.reject(error);
		return response.status(500).json({code: 0, message: "Unexpected error"});
	});
	*/	
});

module.exports = router;