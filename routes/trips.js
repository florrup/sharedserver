//! @file trips.js
//! Describes endpoints for trips

var express = require('express');
var router = express.Router();

const Sequelize = require('sequelize');

var models = require('../models/db'); // loads db.js
var Trip = models.trip; // the model keyed by its name
var Transaction = models.transaction;
var PendingPayment = models.pendingpayment;

var Verify = require('./verify');
var api = require('./api');

var paymethods = require('./paymethods');

const urlRequest = require('request-promise'); // to hit google api

// API URL for payments
var path = require('path');
var environment = process.env.NODE_ENV || "development"; // default is development
var config = require(path.join(__dirname, '..', 'config', 'config.json'))[environment];
var payments_base_url = config.PAYMENTS_API_URL + config.PAYMENTS_API_VERSION_URL;

// Review this line to open table
// CREATE TABLE trips(id SERIAL PRIMARY KEY, _ref VARCHAR(20), applicationowner VARCHAR(20), driverid VARCHAR(20), passengerid VARCHAR(20), startaddressstreet VARCHAR(40), startaddresslocationlat VARCHAR(40), startaddresslocationlon VARCHAR(40), starttimestamp VARCHAR(40), endaddressstreet VARCHAR(40), endaddresslocationlat VARCHAR(20), endaddresslocationlon VARCHAR(20), endtimestamp VARCHAR(20), totaltime VARCHAR(20), waittime VARCHAR(20), traveltime VARCHAR(20), distance VARCHAR(20), route VARCHAR(50), costcurrency VARCHAR(20), costvalue VARCHAR(20));

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
			// id: 0,
			_ref: 'abc',
			applicationowner: '',
			driverid: 0,
			passengerid: 1,
			startaddressstreet: 'Juncal 1234',
			startaddresslocationlat: -34.617096,
			startaddresslocationlon: -58.368441,
			starttimestamp: 0,
			endaddressstreet: 'Malabia 1234',
			endaddresslocationlat: -34.617096,
			endaddresslocationlon: -58.368441,
			endtimestamp: 0,
			totaltime: 3600,
			waittime: 1000,
			traveltime: 2600,
			distance: 15000,
			route: 'Por la calle de abajo',
			costcurrency: '$AR',
			costvalue: 500
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
						'applicationowner', 
						'driverid', 
						'passengerid', 
						'startaddressstreet', 
						'startaddresslocationlat', 
						'startaddresslocationlon', 
						'starttimestamp',
						'endaddressstreet',
						'endaddresslocationlat',
						'endaddresslocationlon',
						'endtimestamp',
						'totaltime',
						'waittime',
						'traveltime',
						'distance',
						'route',
						'costcurrency',
						'costvalue']
	}).then(trips => {
		/* istanbul ignore if  */
		if (!trips) {
			return response.status(500).json({code: 0, message: "Unexpected error at endpoint GET /trips"});
		}
		
		var tripsArray = [];
		trips.forEach(function(item) {
		  var jsonTrip = {
			id: item.id,
			_ref: item._ref,
			applicationOwner: item.applicationowner,
			driver: item.driverid,
			passenger: item.passengerid,
			start: {
				address: {
					street: item.startaddressstreet,
					location: {
						lat: item.startaddresslocationlat,
						lon: item.startaddresslocationlon
					}
				},
				timestamp: item.starttimestamp
			},
			end: {
				address: {
					street: item.endaddressstreet,
					location: {
						lat: item.endaddresslocationlat,
						lon: item.endaddresslocationlon
					}
				},
				timestamp: item.endtimestamp
			},
			totalTime: item.totalTime,
			waitTime: item.waittime,
			travelTime: item.traveltime,
			distance: item.distance,
			route: item.route,
			costCurrency: item.costcurrency,
			costValue: item.costvalue
		  };
		  // console.log('USER JSON &&&&&&&&&&&&&&&&&&&&&&');
		  // console.log(jsonUser);
			tripsArray.push(jsonTrip);
		});
		
		var jsonInResponse = {
			metadata: {
				version: api.apiVersion
			},
			trips: tripsArray
		};
		console.log(jsonInResponse);
		return response.status(200).json(jsonInResponse);
	})
});

/**
 *  Da de alta un trip y ejecuta los pagos correspondientes al conductor y al pasajero
 */
router.post('/', Verify.verifyToken, Verify.verifyAppRole, function(request, response) {
	
	if ( api.isEmpty(request.body.trip.driver) || api.isEmpty(request.body.trip.passenger) || api.isEmpty(request.body.trip.start.address.street)
		|| api.isEmpty(request.body.trip.start.address.location.lat) || api.isEmpty(request.body.trip.start.address.location.lon)
		|| api.isEmpty(request.body.trip.start.timestamp) || api.isEmpty(request.body.trip.end.address.street) || api.isEmpty(request.body.trip.end.address.location.lat) 
		|| api.isEmpty(request.body.trip.end.address.location.lon) || api.isEmpty(request.body.trip.end.timestamp) || api.isEmpty(request.body.trip.totalTime)
		||  api.isEmpty(request.body.trip.waitTime) || api.isEmpty(request.body.trip.travelTime) || api.isEmpty(request.body.trip.distance) || api.isEmpty(request.body.trip.route)
		/*|| api.isEmpty(request.body.trip.cost.currency) || api.isEmpty(request.trip.cost.value)*/
		|| api.isEmpty(request.body.paymethod.paymethod) || api.isEmpty(request.body.paymethod.parameters.ccvv)) {
		
		return response.status(400).json({code: 0, message: "Incumplimiento de precondiciones (parámetros faltantes)"});
	}
	
	/// \TODO get this values from rules engine
	var passengerCost = 300;
	var driverEarn = 200;
	
	// var passengerPaymentParameters = JSON.parse(request.body.paymethod.parameters);
	var passengerPaymentData = {
		paymethod: request.body.paymethod.paymethod,
		ccvv: request.body.paymethod.parameters.ccvv,
		expiration_month: request.body.paymethod.parameters.expiration_month,
		expiration_year: request.body.paymethod.parameters.expiration_year,
		number: request.body.paymethod.parameters.number,
		type: request.body.paymethod.parameters.type 
	};
	
	var driverPaymentData = {
		paymethod: 'cash',
		ccvv: '',
		expiration_month: '',
		expiration_year: '',
		number: '',
		type: 'direct payment'
	};
	
	// Trip creation in Local Data Base
	Trip.create({
			// id: 0,
			_ref: '',
			applicationowner: '',
			driverid: request.body.trip.driver,
			passengerid: request.body.trip.passenger,
			startaddressstreet: request.body.trip.start.address.street,
			startaddresslocationlat: request.body.trip.start.address.location.lat,
			startaddresslocationlon: request.body.trip.start.address.location.lon,
			starttimestamp: request.body.trip.start.timestamp,
			endaddressstreet: request.body.trip.end.address.street,
			endaddresslocationlat: request.body.trip.end.address.location.lat,
			endaddresslocationlon: request.body.trip.end.address.location.lon,
			endtimestamp: request.body.trip.end.Timestamp,
			totaltime: request.body.trip.totalTime,
			waittime: request.body.trip.waitTime,
			traveltime: request.body.trip.travelTime,
			distance: request.body.trip.distance,
			route: request.body.trip.route,
			costcurrency: process.env.PESOSARG,
			costvalue: passengerCost
		}).then(trip => {
				/* istanbul ignore if  */
				if (!trip) {
					return response.status(500).json({code: 0, message: "Unexpected error while trying to save a payment"});
				} else {
					
					var actualTime = (new Date).getTime();
					// Transaction to the passenger
					Transaction.create({
						// id: ...autoincremental,
						_ref: '',
						userid: request.body.trip.passenger,
						tripid: trip.id, // ID recently created by our database
						timestamp: actualTime.toString(),
						costcurrency: process.env.PESOSARG,
						costvalue: -passengerCost,
						description: 'Trip Payment (cost as passenger)'
					})
					.then(localTransactionPassenger => {
						
						var actualTime = (new Date).getTime();
						// Transaction to the driver
						Transaction.create({
							// id: ...autoincremental,
							_ref: '',
							userid: request.body.trip.driver,
							tripid: trip.id, // ID recently created by our database
							timestamp: actualTime,
							costcurrency: process.env.PESOSARG,
							costvalue: driverEarn,
							description: 'Trip Payment (earn as Driver)'
						})
						.then(localTransactionDriver => {
						
							// Remote API payment call
							paymethods.getPaymentsToken()
							.then(function(fulfilled){
								var paymentsToken = paymethods.getLocalPaymentsToken();
								
								// Payment for the passenger to remote API
								const optionsPassenger = {
											method: 'POST',
											uri: payments_base_url+'payments',
											headers: {
												Authorization: 'Bearer '+paymentsToken
											},
											body: {
												transaction_id: localTransactionPassenger.id,
												currency: process.env.PESOSARG,
												value: localTransactionPassenger.costvalue,
												paymentMethod: {
													ccvv: passengerPaymentData.ccvv,
													expiration_month: passengerPaymentData.expiration_month,
													expiration_year: passengerPaymentData.expiration_year,
													method: passengerPaymentData.paymethod,
													number: passengerPaymentData.number,
													type: passengerPaymentData.type
												}
											},
											json: true
								};
								urlRequest(optionsPassenger)
									.then(paymentsPassengerResponse => {
										var resPassenger = JSON.stringify(paymentsPassengerResponse);
										console.log('Payments API returned: ' + resPassenger);
										
										const optionsDriver = {
											method: 'POST',
											uri: payments_base_url+'payments',
											headers: {
												Authorization: 'Bearer '+paymentsToken
											},
											body: {
												transaction_id: localTransactionDriver.id,
												currency: process.env.PESOSARG,
												value: localTransactionDriver.costvalue,
												paymentMethod: {
													ccvv: driverPaymentData.ccvv,
													expiration_month: driverPaymentData.expiration_month,
													expiration_year: driverPaymentData.expiration_year,
													method: driverPaymentData.paymethod,
													number: driverPaymentData.number,
													type: driverPaymentData.type
												}
											},
											json: true
										};
										
										// Payment for the driver
										urlRequest(optionsDriver)
											.then(paymentsDriverResponse => {
												var resDriver = JSON.stringify(paymentsDriverResponse);
												console.log('Payments API returned: ' + resDriver);
												// Payments were locally saved and remotely proccessed, return ok
												
												var jsonInResponse = {
													id: trip.id,
													applicationOwner: trip.applicationowner,
													driver: trip.driverid,
													passenger: trip.passengerid,
													start: {
														address: {
															street: trip.startaddressstreet,
															location: {
																lat: trip.startaddresslocationlat,
																lon: trip.startaddresslocationlon
															}
														},
														timestamp: trip.starttimestamp
													},
													end: {
														address: {
															street: trip.endaddressstreet,
															location: {
																lat: trip.endaddresslocationlat,
																lon: trip.endaddresslocationlon
															}
														},
														timestamp: trip.endtimestamp
													},
													totalTime: trip.totaltime,
													waitTime: trip.waittime,
													travelTime: trip.traveltime,
													distance: trip.distance,
													route: trip.route,
													cost: {
														currency: trip.costcurrency,
														value: trip.costvalue
													}
												}
												return response.status(201).json(jsonInResponse);
											})
											.catch (function(reason) {
												console.log('Error while trying to pay for the DRIVER');
												console.log('Saving Transactions INFO for further proccessing...');
												console.log(JSON.parse(localTransactionDriver));
												console.log(JSON.parse(driverPaymentData));
												saveUnfulfilledPaymentData(localTransactionDriver, driverPaymentData);
												return response.status(500).json({code: 0, message: "Error while trying to pay to the DRIVER. PASSENGER was paid, driver payment data was saved for further proccessing"});
											});
								})
								.catch (function(reason) {
									console.log('Error while trying to pay for the PASSENGER');
									console.log('Saving Transactions INFO for further proccessing...');
									console.log(JSON.parse(localTransactionPassenger));
									console.log(JSON.parse(passengerPaymentData));
									console.log(JSON.parse(localTransactionDriver));
									console.log(JSON.parse(driverPaymentData));
									saveUnfulfilledPaymentData(localTransactionPassenger, passengerPaymentData);
									saveUnfulfilledPaymentData(localTransactionDriver, driverPaymentData);
									return response.status(500).json({code: 0, message: "Error while trying to pay to the PASSENGER. Payments to driver and from passenger will be proccessed later again."});
								});
							})
							.catch (function(reason) {
								console.log('Error while trying to get payments API Token');
								
								console.log('Saving Transactions INFO for further proccessing...');
								console.log(JSON.parse(localTransactionPassenger));
								console.log(JSON.parse(passengerPaymentData));
								console.log(JSON.parse(localTransactionDriver));
								console.log(JSON.parse(driverPaymentData));
								saveUnfulfilledPaymentData(localTransactionPassenger, passengerPaymentData);
								saveUnfulfilledPaymentData(localTransactionDriver, driverPaymentData);
								return response.status(500).json({code: 0, message: "Error while trying to get available payment token. Error while trying to pay to the PASSENGER. Payments to driver and from passenger will be proccessed later again."});
							});
						});
					});
				};
			});
		/* Lets comment for now for more descriptive error messages
		.catch (function(reason) {
			console.log('Error while trying to get available payment methods, could not get Payments API Token');
			return response.status(500).json({code: 0, message: "Error while trying to get available payment methods."});
		});
		*/
	
});

/**
 *  Consultar la cotización de un viaje
 */
router.post('/estimate', Verify.verifyToken, Verify.verifyAppRole, function(request, response) {
	
	if (api.isEmpty(request.body.passenger) 
			|| api.isEmpty(request.body.start.address.location.lat) || api.isEmpty(request.body.start.address.location.lon)
			|| api.isEmpty(request.body.end.address.location.lat) || api.isEmpty(request.body.end.address.location.lat))
	{
		return response.status(400).json({code: 0, message: "Parameters error"});
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
				applicationOwner: trip.applicationowner,
				driver: trip.driverid,
				passenger: trip.passengerid,
				start: {
					address: {
						street: trip.startaddressstreet,
						location: {
							lat: trip.startaddresslocationlat,
							lon: trip.startaddresslocationlon
						}
					},
					timestamp: trip.starttimestamp
				},
				end: {
					address: {
						street: trip.endaddressstreet,
						location: {
							lat: trip.endaddresslocationlat,
							lon: trip.endaddresslocationlon
						}
					},
					timestamp: trip.endtimestamp
				},
				totalTime: trip.totaltime,
				waitTime: trip.waittime,
				travelTime: trip.traveltime,
				distance: trip.distance,
				route: trip.route,
				cost: {
					currency: trip.costcurrency,
					value: trip.costvalue
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

/**
 * This method handles unfulfilled payments.
 * Unfulfilled payment is saved at local data base with needed parameters for further fulfillment
 * Params[in] payment stores the payment structure from local database
 * Params[in] payment_data stores the extra data needed to hit the remote payment api
**/
function saveUnfulfilledPaymentData(payment, payment_data){
	PendingPayment.create({
		// pendingtransactionid; this id is autoincremental handled by database
		originaltransactionid: payment.id,
		_ref: payment._ref,
		userid: payment.userid,
		tripid: payment.tripid,
		timestamp: payment.timestamp,
		costcurrency: payment.costcurrency,
		costvalue: payment.costValue,
		description: payment.description,
		paymethod: payment_data.paymethod,
		expiration_month: payment_data.expiration_month,
		expiration_year: payment_data.expiration_year,
		number: payment_data.number,
		type: payment_data.type 
	});
}

/**
 *  This method clears the application transactions database
 */
function clearTransactionsTable(){
  return new Promise(
    function (resolve, reject) {
      Transaction.destroy({
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

module.exports.clearTransactionsTable = clearTransactionsTable;