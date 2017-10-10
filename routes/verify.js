var BusinessUser = require('../models/businessuser');
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
// var config = require('../config.js');

/**
 * Variable to track manually invalidated tokens
 * In javascript / nodeJS we can't initialize here statically these variables
**/
var invalidatedTokens;

/**
 * Method for token generation. It consumes token secret and token expiration time from env configuration.
**/
exports.getToken = function (businessuser) {
    return jwt.sign(businessuser, process.env.TOKEN_SECRET_KEY,{
        expiresIn: process.env.TOKEN_LIFETIME_IN_SECONDS // 3600
    });
};

exports.invalidateToken = function(token){

	if (typeof invalidatedTokens === "undefined") {
		// If it has been not before, we initialize invalidTokens variable
		invalidatedTokens = [];
	}
	
	// every time we invalidate a new token we clean the list first
	// Checking for expired tokens to remove (we start from the back of the list)
	for(var i = invalidatedTokens.length -1; i >= 0 ; i--){
		jwt.verify(token, process.env.TOKEN_SECRET_KEY, function (err, decoded) {
            if (err) {
				invalidatedTokens.splice(i, 1);
			}
		});
	};
	
	invalidatedTokens.push(token);
}

/**
 * Verifies the token existance in the request body, the request query or the request header
 * The information from the token is extracted and saved in the request itself, in the field decoded, to pass the request to the next middleware calls
**/
exports.verifyToken = function (req, res, next) {
    // check header or url parameters or post parameters for token
    var token = req.body.token || req.query.token || req.headers[process.env.TOKEN_HEADER_FLAG];

	if (typeof invalidatedTokens === "undefined") {
		// If it has been not before, we initialize invalidTokens variable
		invalidatedTokens = [];
	}
	
    // decode token
    if (token && (invalidatedTokens.indexOf(token) === -1)) {
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
        var err = new Error('No token provided or Token was invalidated!');
        err.status = 401; // in this cases 403 is also used, API specified 401
        return next(err);
    }
};

/**
 * This method extracts the info from the decoded request field, wich was inserted by the previous verifyToken method
 * If the decoded info:
 * has the variable userOk
 * ... the user has right privileges and this method authorizes the next middleware call
 *
 * PRE: the method verifyToken has to be called first
**/
exports.verifyUserRole = function (req, res, next) {
	var userOk = req.decoded.userOk;
	
	if (userOk){
		return next();
	}
	else{
		var err = new Error('No BUSINESS USER privileges for this user!');
		err.status = 401;
		return next(err);
	}
};

/**
 * This method extracts the info from the decoded request field, wich was inserted by the previous verifyToken method
 * If the decoded info:
 * has the variable appOk
 * ... the user has right privileges and this method authorizes the next middleware call
 *
 * PRE: the method verifyToken has to be called first
**/
exports.verifyAppRole = function (req, res, next) {
	var appOk = req.decoded.appOk;
	if (appOk){
		return next();
	}
	else{
		var err = new Error('No APP privileges for this user!');
		err.status = 401;
		return next(err);
	}
};

/**
 * This method extracts the info from the decoded request field, wich was inserted by the previous verifyToken method
 * If the decoded info:
 * has the variable mangerOk
 * ... the user has right privileges and this method authorizes the next middleware call
 *
 * PRE: the method verifyToken has to be called first
**/
exports.verifyManagerRole = function (req, res, next) {
	var managerOk = req.decoded.managerOk;
	
	if (managerOk){
		return next();
	}
	else{
		var err = new Error('No MANAGER privileges for this user!');
		err.status = 401;
		return next(err);
	}
};

/**
 * This method extracts the info from the decoded request field, wich was inserted by the previous verifyToken method
 * If the decoded info:
 * has the variable adminOk
 * ... the user has right privileges and this method authorizes the next middleware call
 *
 * PRE: the method verifyToken has to be called first
**/
exports.verifyAdminRole = function (req, res, next) {
	var adminOk = req.decoded.adminOk;
	
	if (adminOk){
		return next();
	}
	else{
		var err = new Error('No ADMIN privileges for this user!');
		err.status = 401;
		return next(err);
	}
};

/**
 * This method extracts the info from the decoded request field, wich was inserted by the previous verifyToken method
 * If the decoded info:
 * has the variable userOk OR the variable appOk
 * ... the user has right privileges and this method authorizes the next middleware call
 *
 * PRE: the method verifyToken has to be called first
**/
exports.verifyUserOrAppRole = function (req, res, next) {
	var appOk = req.decoded.appOk;
	var userOk = req.decoded.userOk;
	
	if (appOk || userOk){
		return next();
	}
	else{
		var err = new Error('No USER or APP privileges for this user!');
		err.status = 401;
		return next(err);
	}
};

exports.verifyManagerOrAppRole = function (req, res, next) {
	var appOk = req.decoded.appOk;
	var managerOk = req.decoded.managerOk;
	
	if (appOk || managerOk){
		return next();
	}
	else{
		var err = new Error('No MANAGER or APP privileges for this user!');
		err.status = 401;
		return next(err);
	}
};