var Sequelize = require("sequelize");
var sequelize = require("./db.js").sequelize;

const Server = sequelize.define('server', {
    id: {
      type: Sequelize.STRING,
	  primaryKey: true
    },
    _ref: {
      type: Sequelize.STRING
    },
    createdBy: {
      type: Sequelize.INTEGER
    },
    createdTime: {
      type: Sequelize.STRING
    },
    name: {
      type: Sequelize.STRING
    },
    lastConnection: {
      type: Sequelize.INTEGER
    }
  });
  
module.exports = Server;