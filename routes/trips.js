//! @file trips.js
//! Describes endpoints for trips

var express = require('express');
var router = express.Router();

const Sequelize = require('sequelize');

var models = require('../models/db'); // loads db.js
var Trip = models.trip; // the model keyed by its name

var Verify = require('./verify');
var api = require('./api');

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
		return response.status(200).json(trips);
	})
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