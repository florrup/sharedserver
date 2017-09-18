var Sequelize = require("sequelize");
var sequelize = require("./db.js").sequelize;

// module.exports = function(sequelize, DataTypes) {
  // var User = sequelize.define('user', {
const User = sequelize.define('user', {
    id: {
      type: Sequelize.STRING,
	    primaryKey: true
    },
    username: {
      type: Sequelize.STRING
    },
    password: {
      type: Sequelize.STRING
    },
    name: {
      type: Sequelize.STRING
    },
    surname: {
      type: Sequelize.STRING
    },
    country: {
      type: Sequelize.STRING
    },
    email: {
      type: Sequelize.STRING
    },
    birthdate: {
      type: Sequelize.STRING
    }
  });
  
module.exports = User;
//  return User;
//}