var express = require('express');
var router = express.Router();

router.use('/users', require('./users'));
router.use('/servers', require('./servers'));

// always return router
module.exports = router;