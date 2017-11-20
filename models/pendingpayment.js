"use strict";
/*istanbul ignore next*/

var Sequelize = require("sequelize");

//CREATE TABLE transactions(pendingtransactionid SERIAL PRIMARY KEY, _ref VARCHAR(20), userid INT NOT NULL, tripid INT NOT NULL, timestamp INT, costcurrency VARCHAR(20) NOT NULL, costvalue INT NOT NULL, description VARCHAR(50));

/**
 * Tabla utilizada para guardar transacciones offline cuando la API remota de pagos no está disponible
 * El valor de la operación debe ser positivo si es un cobro para el usuario (conductor) o negativo si es un gasto del usuario (pasajero)
 */
module.exports = function(sequelize, DataTypes) {
  var PendingPayment = sequelize.define("pendingpayment", {
    pendingtransactionid: {		// temporal id while the payment is being pendant
      type: Sequelize.INTEGER,
      primaryKey: true,
      unique: true,
      autoIncrement: true // from 1 onwards
    },
	originaltransactionid: {
		type: Sequelize.INTEGER, // the id of the original stored transaction to be persisted
		allowNull: false
	},
    _ref: {
      type: Sequelize.STRING
    },
    userid: {
      type: Sequelize.INTEGER, // the id of the owner of the car
      allowNull: false
    },
	tripid:{
		type: Sequelize.INTEGER,
		allowNull: false
	},
	timestamp: {
		type: Sequelize.INTEGER
	},
	costcurrency: {
		type: Sequelize.STRING,
		allowNull: false
	},
	costvalue: {
		type: Sequelize.INTEGER,
		allowNull: false
	},
	description: {
		type: Sequelize.STRING
	},
	paymethod: {
		type: Sequelize.STRING
	},
	expiration_month: {
		type: Sequelize.STRING
	},
	expiration_year: {
		type: Sequelize.STRING
	},
	number: {
		type: Sequelize.STRING
	},
	type: {
		type: Sequelize.STRING
	}
  }, {
    timestamps: false
  });
  
  return PendingPayment;
};
