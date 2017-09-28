var express = require('express');
var router = express.Router();

router.use('/users', require('./users'));
router.use('/servers', require('./servers'));
router.use('/business-users', require('./business-users'));

// always return router
module.exports = router;