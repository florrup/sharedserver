var Sequelize = require("sequelize");
var sequelize = require("./db.js").sequelize;

// module.exports = function(sequelize, DataTypes) {
  // var User = sequelize.define('user', {
const User = sequelize.define('user', {
    id: {
      type: Sequelize.STRING,
	    primaryKey: true
    },
    name: {
      type: Sequelize.STRING
    },
    surname: {
      type: Sequelize.STRING
    },
    complete: {
      type: Sequelize.BOOLEAN
    }
  });
  
module.exports = User;
//  return User;
//}