"use strict";
/*istanbul ignore next*/

var Sequelize = require("sequelize");

/**
 *  Define la estructura de datos de un cambio en una rule
 *
 */
 
module.exports = function(sequelize, DataTypes) {
  var RuleChange = sequelize.define("rulechange", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      unique: true,
      autoIncrement: true // from 1 onwards
    },
    _ref: {
      type: Sequelize.STRING
    },
    name: {
      type: Sequelize.STRING
    },
    blobcondition: {
      type: Sequelize.STRING
    },
    blobconsequence: {
      type: Sequelize.STRING
    },
    blobpriority: {
      type: Sequelize.STRING
    },
    active: {
      type: Sequelize.BOOLEAN
    },
    reason: {
      type: Sequelize.STRING
    },
    time: {
      type: Sequelize.DATE
    },
    businessuser: {
      type: Sequelize.STRING // TODO deberiamos guardar aca un json con todos los datos del businessuser que hizo el cambio
    },
    userinfo: {
      type: Sequelize.STRING
    }
  }, {
    timestamps: false
  });
  
  return RuleChange;
};