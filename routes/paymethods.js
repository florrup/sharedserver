var express = require('express');
var router = express.Router();
var Verify = require('./verify');
var api = require('./api');

var models = require('../models/db'); // loads db.js
var Users = models.user;

const urlRequest = require('request-promise'); // to hit payments api

// Get environment variables from config file is as follows...
var path = require('path');
var environment = process.env.NODE_ENV || "development"; // default is development
var config = require(path.join(__dirname, '..', 'config', 'config.json'))[environment];

var paymentsToken;

/**
 * Payments API main URL builded from the config.json file
 * May look like: "https://shielded-escarpment-27661.herokuapp.com/api/v1/"
**/
var payments_base_url = config.PAYMENTS_API_URL + config.PAYMENTS_API_VERSION_URL;

/**
 *  Obtener los métodos de pago disponibles
 *
 */
router.get('/', Verify.verifyToken, Verify.verifyUserOrAppRole, function(request, response) {

	console.log('Fetching paymethods: '+payments_base_url+'paymethods');
	getPaymentsToken()
	.then(function(fulfilled){
		
			console.log('PAYMENTS API TOKEN LOADED 222222222222');
			console.log('Payments API Token: ' + paymentsToken); // paymentsToken	);
			
			const options = {
					method: 'GET',
					uri: payments_base_url+'paymethods',
					/*
					auth: {
						bearer: paymentsToken
					}
					*/
					headers: {
						// 'User-Agent': 'Request-Promise',
						Authorization: 'Bearer '+paymentsToken
					}
				};
				
			urlRequest(options)
				.then(paymentsApiResponse => {
					
					console.log('$$$$$$$$$$$ Payment Methods response $$$$$$$$$$$$$$$$$');
					
					var res = JSON.parse(paymentsApiResponse);
					console.log(res);
					
					/*
					var paymethods = [];
					res.foreach(function(payMethod){
						var params = payMethod.parameters;
					});
					*/
					
					var jsonInResponse = {
						metadata: {
							version: api.apiVersion
						},
						paymethods: res.items
					};
					
					console.log(jsonInResponse);
					return response.status(200).json(jsonInResponse);
				})/*
				.catch(function (error) {
					console.log('Error while trying to get available payment methods');
					return response.status(500).json({code: 0, message: "Error while trying to get available payment methods."});
				});*/
		})
	.catch(function(reason) {
		console.log('Error while trying to get available payment methods, could not get Payments API Token');
		return response.status(500).json({code: 0, message: "Error while trying to get available payment methods."});
	});
});

module.exports = router;


/**
 *  This method gets a valid token from payments API
 */
function getPaymentsToken(){
	if (typeof paymentsToken === "undefined"){
		paymentsToken = '';
	};

  return new Promise(
    function (resolve, reject) {
      
		
	const options = {
			method: 'POST',
			uri: payments_base_url+'user/oauth/authorize',
			body: {
				client_id: config.PAYMENTS_API_CLIENT_ID,
				client_secret: config.PAYMENTS_API_CLIENT_SECRET
			},
			json: true // Automatically stringifies the body to JSON
		};
		
	urlRequest(options)
		.then(paymentsApiResponse => {
			// var response = JSON.parse(paymentsApiResponse);
			paymentsToken = paymentsApiResponse.access_token; // response.access_token;
			
			console.log('PAYMENTS API TOKEN LOADED');
			console.log('Payments API Token: ' + paymentsApiResponse.access_token); // response.access_token);
			
			resolve(true);
		})
  })
};

module.exports.getPaymentsToken = getPaymentsToken;
