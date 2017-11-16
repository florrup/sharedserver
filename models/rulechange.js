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
    blobCondition: {
      type: Sequelize.STRING
    },
    blobConsequence: {
      type: Sequelize.STRING
    },
    blobPriority: {
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
      type: Sequelize.INTEGER // id del business user que hizo el cambio
    }
  }, {
    timestamps: false
  });
  
  return RuleChange;
};