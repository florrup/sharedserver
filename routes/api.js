var express = require('express');
var router = express.Router();

router.use('/users', require('./users'));

// always return router
module.exports = router;