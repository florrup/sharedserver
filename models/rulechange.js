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
      type: Sequelize.STRING(5000)
    },
    blobconsequence: {
      type: Sequelize.STRING(5000)
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
      type: Sequelize.STRING // Id del businessuser
    },
    userinfo: {
      type: Sequelize.STRING // Este es un JSON con toda la información del businessuser
    }
  }, {
    timestamps: false
  });
  
  return RuleChange;
};