//! @file trips.js
//! Describes endpoints for trips

var express = require('express');
var router = express.Router();

const Sequelize = require('sequelize');

var models = require('../models/db'); // loads db.js
var Trip = models.trip; // the model keyed by its name

var Verify = require('./verify');
var api = require('./api');

const urlRequest = require('request-promise'); // to hit google api

// Review this line to open table
// CREATE TABLE users(id SERIAL PRIMARY KEY, _ref VARCHAR(20), applicationowner VARCHAR(20), driverId VARCHAR(20), passangerId VARCHAR(20), startAddressStreet VARCHAR(40), startAddressLocationLat VARCHAR(40), startAddressLocationLon VARCHAR(40), startTimestamp VARCHAR(40), endAddressStreet VARCHAR(40), endAddressLocationLat VARCHAR(20), endAddressLocationLon VARCHAR(20), endTimestamp VARCHAR(20), totalTime VARCHAR(20), waitTime VARCHAR(20), travelTime VARCHAR(20), distance VARCHAR(20), route VARCHAR(20), costCurrency VARCHAR(20), costValue VARCHAR(20));

/**
 * Test method to empty the trips database and create a dummy app trip (without valid data) in order to make further tests
 * This method is available only when the ENVIRONMENT is set as 'development' or 'test'
 * 
 * PRE: process.env.ENV_NODE has 'development' or 'test' value
 */
router.get('/initAndWriteDummyTrip', function(request, response) {
  // Test code: dummy register and table initialization:
  // force: true will drop the table if it already exists
  /* istanbul ignore else  */
	if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test'){
	  Trip.sync({force: true}).then(() => {
		// Table created
		
		var dummyTrip = {
			id: 0,
			_ref: 'abc',
			applicationOwner: '',
			driverId: 0,
			passangerId: 1,
			startAddressStreet: 'Juncal 1234',
			startAddressLocationLat: -34.617096,
			startAddressLocationLon: -58.368441,
			startTimestamp: 0,
			endAddressStreet: 'Malabia 1234',
			endAddressLocationLat: -34.617096,
			endAddressLocationLon: -58.368441,
			endTimestamp: 0,
			totalTime: 3600,
			waitTime: 1000,
			travelTime: 2600,
			distance: 15000,
			route: 'Por la calle de abajo',
			costCurrency: '$AR',
			costValue: 500
		};
		
		Trip.create(dummyTrip)
		.then(() => {
			return response.status(200).json(dummyTrip);
			}).catch(error => {
			  	/* istanbul ignore next  */
				return response.status(500).json({code: 0, message: "Unexpected error while trying to create new dummy trip for testing."});
				// mhhh, wth!
			});
	    });
	} else {
		/* istanbul ignore next  */
		return response.status(500).json({code: 0, message: "Incorrect environment to use testing exclusive methods"});
	}
});

/**
 *  Devuelve toda la información acerca de todos los application trips.
 *
 */
router.get('/', Verify.verifyToken, Verify.verifyUserOrAppRole, function(request, response) {
	Trip.findAll({
		attributes: ['id', 
						'_ref', 
						'applicationOwner', 
						'driverId', 
						'passangerId', 
						'startAddressStreet', 
						'startAddressLocationLat', 
						'startAddressLocationLon', 
						'startTimestamp',
						'endAddressStreet',
						'endAddressLocationLat',
						'endAddressLocationLon',
						'endTimestamp',
						'totalTime',
						'waitTime',
						'travelTime',
						'distance',
						'route',
						'costCurrency',
						'costValue']
	}).then(trips => {
		/* istanbul ignore if  */
		if (!trips) {
			return response.status(500).json({code: 0, message: "Unexpected error at endpoint GET /trips"});
		}
		
		var jsonInResponse = {
			metadata: {
				version: api.apiVersion
			},
			trips: trips
		};
		return response.status(200).json(jsonInResponse);
	})
});

/**
 *  Da de alta un trip
 */
router.post('/', Verify.verifyToken, Verify.verifyAppRole, function(request, response) {
	if (api.isEmpty(request.body.driver) || api.isEmpty(request.body.passanger) || api.isEmpty(request.body.start.address.street)
		|| api.isEmpty(request.body.start.address.location.latitude) || api.isEmpty(request.body.start.address.location.longitude)
		|| api.isEmpty(request.body.start.timestamp) || api.isEmpty(request.body.end.address.street) || api.isEmpty(request.body.end.address.location.latitude) 
		|| api.isEmpty(request.body.end.address.location.longitude) || api.isEmpty(request.body.end.Timestamp) || api.isEmpty(request.body.totalTime)
		|| api.isEmpty(request.body.waitTime) || api.isEmpty(request.body.travelTime) || api.isEmpty(request.body.distance) || api.isEmpty(request.body.route)
		|| api.isEmpty(request.body.cost.currency) || api.isEmpty(request.cost.value)) {
		return response.status(400).json({code: 0, message: "Incumplimiento de precondiciones (parámetros faltantes)"});
	}
	
	// Payments API: cobrar al pasajero
	
	// Payments API: pagar al conductor
	
	Trip.create({
		// id: 0,
		_ref: '',
		applicationOwner: '',
		driverId: request.body.driver,
		passangerId: request.body.passanger,
		startAddressStreet: request.body.start.address.street,
		startAddressLocationLat: request.body.start.address.location.latitude,
		startAddressLocationLon: request.body.start.address.location.longitude,
		startTimestamp: request.body.start.timestamp,
		endAddressStreet: request.body.end.address.street,
		endAddressLocationLat: request.body.end.address.location.latitude,
		endAddressLocationLon: request.body.end.address.location.longitude,
		endTimestamp: request.body.end.Timestamp,
		totalTime: request.body.totalTime,
		waitTime: request.body.waitTime,
		travelTime: request.body.travelTime,
		distance: request.body.distance,
		route: request.body.route,
		costCurrency: request.body.cost.currency,
		costValue: request.body.cost.value
	}).then(trip => {
			/* istanbul ignore if  */
			if (!trip) {
				return response.status(500).json({code: 0, message: "Unexpected error while trying to save a payment"});
			} else {
				var jsonInResponse = {
					id: trip.id,
					applicationOwner: trip.applicationOwner,
					driver: trip.driverId,
					passanger: trip.passangerId,
					start: {
						address: {
							street: trip.startAddressStreet,
							location: {
								lat: trip.startAddressLocationLat,
								lon: trip.startAddressLocationLon
							}
						},
						timestamp: trip.startTimestamp
					},
					end: {
						address: {
							street: trip.endAddressStreet,
							location: {
								lat: trip.endAddressLocationLat,
								lon: trip.endAddressLocationLon
							}
						},
						timestamp: trip.endTimestamp
					},
					totalTime: trip.totalTime,
					waitTime: trip.waitTime,
					travelTime: trip.travelTime,
					distance: trip.distance,
					route: trip.route,
					cost: {
						currency: trip.costCurrency,
						value: trip.costValue
					}
				}
				return response.status(201).json(jsonInResponse);
			}
		});
});

/**
 *  Consultar la cotización de un viaje
 */
router.post('/estimate', Verify.verifyToken, Verify.verifyAppRole, function(request, response) {
	
	if (api.isEmpty(request.body.passanger) 
			|| api.isEmpty(request.body.start.address.location.lat) || api.isEmpty(request.body.start.address.location.lon)
			|| api.isEmpty(request.body.end.address.location.lat) || api.isEmpty(request.body.end.address.location.lat))
	{
		return response.status(400).json({code: 0, message: "This method: POST /trip/estimate is not yet implemented"});
	}
	
	var googleAPIPath = 'https://maps.googleapis.com/maps/api/directions/json?origin=';
	googleAPIPath = googleAPIPath+request.body.start.address.location.lat+','+request.body.start.address.location.lon;
	googleAPIPath = googleAPIPath+'&destination='+request.body.end.address.location.lat+','+request.body.end.address.location.lon;
	googleAPIPath = googleAPIPath+'&alternatives=true';
	
	const options = {
					method: 'GET',
					uri: googleAPIPath,
					/*
					auth: {
						bearer: paymentsToken
					}
					
					headers: {
						// 'User-Agent': 'Request-Promise',
						Authorization: 'Bearer '+paymentsToken
					}
					*/
				};
				
			urlRequest(options)
				.then(googleMapsApiResponse => {
					var res = JSON.parse(googleMapsApiResponse);
					/// \TODO traer de rules -> Facts el precio por kilómetro para meter acá
					var valorEstimado = 50 * res.routes[0].legs[0].distance.value / 1000 /*distance is in meters*/;
					
					var jsonInResponse = {
						metadata: {
							version: api.apiVersion
						},
						cost: {
							currency: '$AR',
							value: valorEstimado
						}
					};
					return response.status(200).json(jsonInResponse);
				});
});


/**
 *  Devuelve toda la información del viaje con id especificado
 *
 */
router.get('/:tripId', Verify.verifyToken, Verify.verifyUserOrAppRole, function(request, response) {
	Trip.find({
		where: {
			id: request.params.tripId
		}
	}).then(trip => {
		if (!trip) {
			return response.status(404).json({code: 0, message: "Trip inexistente"});
		}
		var jsonInResponse = {
			metadata: {
				version: api.apiVersion
			},
			
			trip: {
				id: trip.id,
				applicationOwner: trip.applicationOwner,
				driver: trip.driverId,
				passanger: trip.passangerId,
				start: {
					address: {
						street: trip.startAddressStreet,
						location: {
							lat: trip.startAddressLocationLat,
							lon: trip.startAddressLocationLon
						}
					},
					timestamp: trip.startTimestamp
				},
				end: {
					address: {
						street: trip.endAddressStreet,
						location: {
							lat: trip.endAddressLocationLat,
							lon: trip.endAddressLocationLon
						}
					},
					timestamp: trip.endTimestamp
				},
				totalTime: trip.totalTime,
				waitTime: trip.waitTime,
				travelTime: trip.travelTime,
				distance: trip.distance,
				route: trip.route,
				cost: {
					currency: trip.costCurrency,
					value: trip.costValue
				}
			}
		};
		return response.status(200).json(jsonInResponse);
	}).catch(function (error) {
		/* istanbul ignore next  */
		return response.status(500).json({code: 0, message: "Unexpected error"});
	});
});

// Return router after endpoints definition
module.exports = router;

/**
 *  This method clears the trips database, leaving blank the trips table
 */
function clearTripsTable(){
	return new Promise(
	  function (resolve, reject) {
		Trip.destroy({
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

module.exports.clearTripsTable = clearTripsTable;