var BusinessUser = require('../models/businessuser');
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
// var config = require('../config.js');

/**
 * Variable to track manually invalidated tokens
 * In javascript / nodeJS we can't initialize here statically these variables
 * This variable is a map structure [ key=username, value=array[invalidatedToken1, invalidatedToken2, ...] ]
**/
var invalidatedTokens;

/**
 * Valid Tokens emmited by the shared server to application servers
 * This variable is a map structure: [key=username, value=validToken]
 * If a username has a valid token and a new one is emmited, the previous token will be added to the invalidatedTokens list
**/
var validTokens;

/**
 * Method for token generation. It consumes token secret and token expiration time from env configuration.
**/
exports.getToken = function (payload) {
	if (typeof invalidatedTokens === "undefined") {
		invalidatedTokens = new Map();
	}
	if (typeof validTokens === "undefined") {
		validTokens = new Map();
	}
	
    newToken = jwt.sign(payload, process.env.TOKEN_SECRET_KEY,{expiresIn: parseInt(process.env.TOKEN_LIFETIME_IN_SECONDS) /*3600*/});
	
	/*
	if(validTokens.has(payload.username)){
		var oldValidToken = validTokens.get(payload.username);
		if (oldValidToken != newToken){
			console.log('OLD TOKEN: ' +oldValidToken);
			console.log('NEW TOKEN: ' + newToken);
			
			// ----------------------
			// NOTE: this invalidation of old token cannot be made here because servers may create tokens for other servers and don't need their own token invalidated
			// this.invalidateToken(oldValidToken); // invalidate old valid token
			// ----------------------
			validTokens.set(payload.username, newToken); // add new valid token
		} else {
			return newToken; // if old and new token are the same, leave the old token as valid
		}
	}
	*/
	/*
	if(invalidatedTokens.has(payload.username)){
		var index = invalidatedTokens.get(payload.username).indexOf(newToken);
		if (index != -1){
			invalidatedTokens.get(payload.username).splice(index, 1); // if the newToken was invalidated we remove it from the invalidated list (may happen when fast testing)
		}
	}
	*/
	validTokens.set(payload.username, newToken);
	return newToken;
};

/**
 * Reports all actual authorized users, method used in backoffice application
 * usersWithAuthorizedTokens is a map structure with key=username ; value=validToken
 * invalidatedTokens is a map structure with key=username ; value=array of invalidated tokens
**/
exports.reportActualState = function(){
	if (typeof invalidatedTokens === "undefined") {
		invalidatedTokens = new Map();
	}
	if (typeof validTokens === "undefined") {
		validTokens = new Map();
	}
	
	var jsonInResponse = {
		'usersWithAuthorizedTokens': JSON.stringify(validTokens), // this structure is a map: key=username, value=token.
		'invalidatedTokens': JSON.stringify(Array.from(invalidatedTokens)) // this structure is a map: key=username, value=array of invalidated tokens from key username
	};
	
	return jsonInResponse;
}

/**
 * Invalidates current valid token from a user
**/
exports.invalidateActualValidTokenFromUser = function (username){
	if (typeof invalidatedTokens === "undefined") {
		invalidatedTokens = new Map();
	}
	if (typeof validTokens === "undefined") {
		validTokens = new Map();
	}
	if(validTokens.has(username)){
		var oldValidToken = validTokens.get(username);
		this.invalidateToken(oldValidToken); // invalidate old valid token
		validTokens.delete(oldValidToken);
	}
};


/**
 * Checks if a token has been marked as invalid
**/
function isTokenInvalidated(token){
	
	if (typeof invalidatedTokens === "undefined") {
		invalidatedTokens = new Map();
	}
	if (typeof validTokens === "undefined") {
		validTokens = new Map();
	}
	
	try {
		var decoded = jwt.verify(token, process.env.TOKEN_SECRET_KEY);
		var username = decoded.username;
		console.log(Array.from(invalidatedTokens));
		console.log(username);
		if (invalidatedTokens.has(username)){
			var token_was_invalidated_before = false;
			var invalidTokensFromUser = invalidatedTokens.get(username);
			for (var aTokenIndex in invalidTokensFromUser) {
				// console.log('A token'+aToken);
				// console.log('A real token'+invalidTokensFromUser[aTokenIndex]);
				// console.log('Given token'+token);
				if (invalidTokensFromUser[aTokenIndex] === token){
					token_was_invalidated_before = true; // token is listed as invalid
				}
			}
			return token_was_invalidated_before;
		}
		else {
			return false; // username has no invalidated tokens
		} 
	} catch(err) {
		// console.log('############################################# TOKEN INVALID RIGHT AWAY!! #############################################');
		return true; // token is not valid right away
	}
};


/**
 * Invalidates a token
**/
exports.invalidateToken = function(token){
	if (typeof invalidatedTokens === "undefined") {
		invalidatedTokens = new Map();
	}
	if (typeof validTokens === "undefined") {
		validTokens = new Map();
	}
	
	// remove token, if present, from validTokens list
	
	jwt.verify(token, process.env.TOKEN_SECRET_KEY, function (err, decoded) {
            if (err) {
				// or the token is not valid right away... or it is expired. We check that and remove token from valid token list
				jwt.verify(token, process.env.TOKEN_SECRET_KEY, {ignoreExpiration: true}, function (err, decoded) {
					if (!err){
						if(validTokens.has(decoded.username)){
							if (validTokens.get(decoded.username) === token){
								validTokens.delete(decoded.username);
							}
						}
					}
				});
			}
			else {
				console.log('INVALIDATING TOKEN: ' + token);
				// invalidatedTokens.set(decoded.username, token);
				if (invalidatedTokens.has(decoded.username)){
					if (invalidatedTokens.get(decoded.username).indexOf(token) === -1 ) // we only add the token if the same token was not previously invalidated
						invalidatedTokens.get(decoded.username).push(token);
				}
				else{
					invalidatedTokens.set(decoded.username, new Array(token));
				}
				if(validTokens.has(decoded.username)){
					if (validTokens.get(decoded.username) === token){
						validTokens.delete(decoded.username);
					}
				}
			}
	});
};

/**
 * Verifies the token existance in the request body, the request query or the request header
 * The information from the token is extracted and saved in the request itself, in the field decoded, to pass the request to the next middleware calls
**/
exports.verifyToken = function (req, res, next) {
    // check header or url parameters or post parameters for token
    var token = req.body.token || req.query.token || req.headers[process.env.TOKEN_HEADER_FLAG];

	if (typeof invalidatedTokens === "undefined") {
		invalidatedTokens = new Map();
	}
	if (typeof validTokens === "undefined") {
		validTokens = new Map();
	}
	
	console.log('#### Verificating TOKEN: '+token);
    // decode token
    if (token) {
		
		// Has the token been previously excluded?
		if (isTokenInvalidated(token)){
			var err = new Error('Token was invalidated or is not valid!');
			err.status = 401; // in this cases 403 is also used, API specified 401
			return next(err);
		}
		else {
			// verifies secret and checks exp
			jwt.verify(token, process.env.TOKEN_SECRET_KEY, function (err, decoded) {
				if (err) {
					console.log('TOKEN VERIFICATION ERROR: '+JSON.stringify(err));
					var errorMessage = JSON.stringify(err);
					var err = new Error('You are not authenticated! '+errorMessage);
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
		}
    } else {
        // if there is no token or the signature is not from this application or token has been adulterated
        // return an error
        var err = new Error('No token provided!');
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

/**
 * This method extracts the info from the decoded request field, wich was inserted by the previous verifyToken method
 * If the decoded info:
 * has the variable managerOk OR the variable appOk
 * ... the user has right privileges and this method authorizes the next middleware call
 *
 * PRE: the method verifyToken has to be called first
**/
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