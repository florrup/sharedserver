"use strict";
/*istanbul ignore next*/

var Sequelize = require("sequelize");

//CREATE TABLE transactions(id SERIAL PRIMARY KEY, _ref VARCHAR(20), remotetransactionid VARCHAR(50), userid INT NOT NULL, tripid INT NOT NULL, timestamp VARCHAR(30), costcurrency VARCHAR(20) NOT NULL, costvalue INT NOT NULL, description VARCHAR(50));

/**
 * Tabla utilizada para guardar transacciones offline cuando la API remota de pagos no está disponible
 * El valor de la operación debe ser positivo si es un cobro para el usuario (conductor) o negativo si es un gasto del usuario (pasajero)
 */
module.exports = function(sequelize, DataTypes) {
  var Transaction = sequelize.define("transaction", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      unique: true,
      autoIncrement: true // from 1 onwards
    },
    _ref: {
      type: Sequelize.STRING
    },
	remotetransactionid: {
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
		type: Sequelize.STRING
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
	}
  }, {
    timestamps: false
  });
  
  return Transaction;
};
