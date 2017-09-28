var Sequelize = require("sequelize");
var sequelize = require("./db.js").sequelize;

const BusinessUser = sequelize.define('businessuser', {
    id: {
      type: Sequelize.STRING,
	    primaryKey: true
    },
    _ref: {
      type: Sequelize.STRING
    },
    username: {
      type: Sequelize.INTEGER
    },
    password: {
      type: Sequelize.STRING
    },
    name: {
      type: Sequelize.STRING
    },
    surname: {
      type: Sequelize.STRING
    }
  }, {
    timestamps: false
});
  
module.exports = BusinessUser;