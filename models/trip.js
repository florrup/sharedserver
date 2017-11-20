'use strict';
/*istanbul ignore next*/

var Sequelize = require("sequelize");

/**
 *  Define estructura de datos de un viaje (trip)
 *  Un viaje tiene los siguientes atributos
 *  - id
 *  - applicationOwner
 *  - driverId
 *  - passengerId
 *  - startAddressStreet (string)
 *  - startAddressLocationLat
 *  - startAddressLocationLong
 *  - startTimestamp (epoch)
 *  - endAddressStreet (string)
 *  - endAddressLocationLat
 *  - endAddressLocationLong
 *  - endTimestamp (epoch)
 *  - totalTime (seconds)
 *  - waitTime (seconds)
 *  - travelTime (seconds)
 *  - distance (meters, if available)
 *  - route (optional)
 *  - costCurrency 
 *  - costValue // aka amount
 *
 */

module.exports = function(sequelize, DataTypes) {
	var Trip = sequelize.define("trip", {
		id: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			unique: true,
			autoIncrement: true // from 1 onwards
		},
		_ref: {
			type: Sequelize.STRING
		},
		applicationowner: {
			type: Sequelize.STRING
		},
		driverid: {
			type: Sequelize.INTEGER,
			allowNull: false
		},
		passengerid: {
			type: Sequelize.INTEGER,
			allowNull: false
		},
		startaddressstreet: {
			type: Sequelize.STRING
		},
		startaddresslocationlat: {
			type: Sequelize.INTEGER,
			allowNull: false
		},
		startaddresslocationlon: {
			type: Sequelize.INTEGER,
			allowNull: false
		},
		starttimestamp: {
			type: Sequelize.INTEGER // epoch time
		},
		endAddressStreet: {
			type: Sequelize.STRING // Street Address (optional)
		},
		endaddresslocationlat: {
			type: Sequelize.INTEGER, // Latitude
			allowNull: false
		},
		endaddresslocationlon: {
			type: Sequelize.INTEGER, // Longitude
			allowNull: false
		},
		endtimestamp: {
			type: Sequelize.INTEGER // epoch time
		},
		totalTime: {
			type: Sequelize.INTEGER // seconds
		},
		waittime: {
			type: Sequelize.INTEGER // seconds
		},
		traveltime: {
			type: Sequelize.INTEGER // seconds
		},
		distance: {
			type: Sequelize.INTEGER // meters
		},
		route: {
			type: Sequelize.STRING // to be defined...
		},
		costcurrency: {
			type: Sequelize.STRING, // $AR, $USD, US DOLLARS, etc
			allowNull: false
		},
		costvalue: {
			type: Sequelize.INTEGER, // currency amount, ie 10.45; 11,57
			allowNull: false
		}
	
	}, {
		timestamps: false
	});
	return Trip;
};