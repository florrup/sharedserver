var BusinessUser = require('../models/businessuser');
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
// var config = require('../config.js');

exports.getToken = function (businessuser) {
    return jwt.sign(businessuser, process.env.TOKEN_SECRET_KEY,{
        expiresIn: 3600
    });
};

exports.verifyToken = function (req, res, next) {
    // check header or url parameters or post parameters for token
    var token = req.body.token || req.query.token || req.headers[process.env.TOKEN_HEADER_FLAG];

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

exports.verifyUserRole = function (req, res, next) {
	var userOk = req.decoded.userOk;
	
	if (userOk){
		return next();
	}
	else{
		var err = new Error('No BUSINESS USER privileges for this user!');
		err.status = 403;
		return next(err);
	}
};

exports.verifyAppRole = function (req, res, next) {
	var appOk = req.decoded.appOk;
	
	if (appOk){
		return next();
	}
	else{
		var err = new Error('No APP privileges for this user!');
		err.status = 403;
		return next(err);
	}
};

exports.verifyManagerRole = function (req, res, next) {
	var managerOk = req.decoded.managerOk;
	
	if (managerOk){
		return next();
	}
	else{
		var err = new Error('No MANAGER privileges for this user!');
		err.status = 403;
		return next(err);
	}
};

exports.verifyAdminRole = function (req, res, next) {
	var adminOk = req.decoded.adminOk;
	
	if (adminOk){
		return next();
	}
	else{
		var err = new Error('No ADMIN privileges for this user!');
		err.status = 403;
		return next(err);
	}
};

exports.verifyUserOrAppRole = function (req, res, next) {
	var appOk = req.decoded.appOk;
	var userOk = req.decoded.userOk;
	
	if (appOk || userOk){
		return next();
	}
	else{
		var err = new Error('No USER or APP privileges for this user!');
		err.status = 403;
		return next(err);
	}
};