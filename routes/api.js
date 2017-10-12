var express = require('express');
var router = express.Router();

router.use('/users', require('./users'));
router.use('/servers', require('./servers'));
router.use('/business-users', require('./business-users'));
router.use('/token', require('./token'));

// API Version
var apiVersion = '1.0';
exports.apiVersion = apiVersion;

// always return router
module.exports = router;