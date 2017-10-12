var Sequelize = require("sequelize");
var sequelize = require("./db.js").sequelize;

/**
 *  Define la estructura de datos de un usuario cliente de la aplicación android
 *  Usuarios de aplicación son típicamente pasajeros y conductores
 *
 */
const User = sequelize.define('user', {
    id: {
      type: Sequelize.STRING,
	    primaryKey: true
    },
    username: {
      type: Sequelize.STRING,
	    unique: true
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