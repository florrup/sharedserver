var BusinessUser = require('../models/businessuser');
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
// var config = require('../config.js');

exports.getToken = function (businessuser) {
    return jwt.sign(businessuser, process.env.TOKEN_SECRET_KEY,{
        expiresIn: 3600
    });
};

exports.verifyOrdinaryUser = function (req, res, next) {
    // check header or url parameters or post parameters for token
    var token = req.body.token || req.query.token || req.headers['x-access-token'];

    // decode token
    if (token) {
        // verifies secret and checks exp
        jwt.verify(token, process.env.TOKEN_SECRET_KEY, function (err, decoded) {
            if (err) {
                var err = new Error('You are not authenticated!');
                err.status = 401;
                return next(err);
            } else {
                // if everything is good, save to request for use in other routes
				// this method assures that TOKEN exists and it's signature is from this server
				// ... and stores the info from the token in the decoded variable 
                req.decoded = decoded;
                next();
            }
        });
    } else {
        // if there is no token or the signature is not from this application or token has been adulterated
        // return an error
        var err = new Error('No token provided!');
        err.status = 400; // in this cases 403 is also used, API specified 400
        return next(err);
    }
};