//! @package test
//! @file cars.js

process.env.DATABASE_URL = 'postgres://nvvgpxztxxdugy:794bac95662fe3643cd76663cac5d8aab38e124878b513e5a796068e9ebbe281@ec2-23-23-234-118.compute-1.amazonaws.com:5432/de2pgllaiv55c3';

process.env.DATABASE_USER='nvvgpxztxxdugy';
process.env.DATABASE_HOST='ec2-23-23-234-118.compute-1.amazonaws.com';
process.env.DATABASE='de2pgllaiv55c3';
process.env.DATABASE_PASS='794bac95662fe3643cd76663cac5d8aab38e124878b513e5a796068e9ebbe281';

var chai = require('chai');
var chaiHttp = require('chai-http');
var baseUrl = 'http://localhost:5000/api';
var api = require('../routes/api');
var should = chai.should();
var expect = chai.expect;
var util = require('util');
var token_header_flag = 'x-access-token';

chai.use(chaiHttp);

var jwt = require('jsonwebtoken');

/**
 *  Test methods for application users endpoints
 *
 * Application users are the drivers or passangers that use the system and have a profile in this database
 */
describe('Cars', function()  {

	var usersAPI = require('../routes/users');
	var serversAPI = require('../routes/servers');

	var user = {
		_ref: 'aaa',
		type: 'conductor',
		username: 'johnny',
		password: 'aaaa',
		firstName: 'John',
		lastName: 'Hancock',
		country: 'Argentina',
		email: 'johnny123@gmail.com',
		birthdate: '24/05/1992'
	};

	var userId = 1;

	var car = {
	    "id": 25,
	    "_ref": "hola",
	    "owner": 1, // id del user 
	    "properties": [{"name": "Ecosport", "value": "autito"}, {"name": "Fiesta", "value": "autito2"}]
	};

	describe('/GET users car', function() {
	  	it('it shouldn\'t GET cars from user without cars', function(done) {
			this.timeout(15000);
			
			usersAPI.clearUsersTable()
			.then( function(fulfilled){
				serversAPI.clearServersTable()
				.then(function(fulfilled) {
					chai.request(baseUrl)
					.get('/servers/initAndWriteDummyServer/')
					.end((err,res) => {
						var token = res.body.serverToken;

						chai.request(baseUrl)
						.post('/users/')
						.set(token_header_flag, token)
						.send(user)
						.end((err, res) => {
							res.body.should.have.property('user');
							usersAPI.clearCarsTable()
							.then( function(fulfilled){
								chai.request(baseUrl)
								.get('/users/' + userId + '/cars/')
								.set(token_header_flag, token)
								.end((err, res) => {
									res.should.have.status(200);
									res.body.should.be.a('array');
									done();
								});
							});
						});
					});
				});
			});
	    });

	  	it('it should GET cars from existing user', function(done) {
			this.timeout(15000);
			
			usersAPI.clearUsersTable()
			.then( function(fulfilled){
				serversAPI.clearServersTable()
				.then(function(fulfilled) {
					chai.request(baseUrl)
					.get('/servers/initAndWriteDummyServer/')
					.end((err,res) => {
						
						console.log('Is this body w token?: ', res.body);
						var token = res.body.serverToken;

						chai.request(baseUrl)
						.post('/users/')
						.set(token_header_flag, token)
						.send(user)
						.end((err, res) => {
							res.body.should.have.property('user');

							usersAPI.clearCarsTable()
							.then( function(fulfilled){
								chai.request(baseUrl)
								.post('/users/' + user.id + '/cars/')
								.set(token_header_flag, token)
								.send(car)
								.end((err, res) => {
									console.log(car);
									res.should.have.status(201);
									res.body.should.have.property('metadata');
									res.body.should.have.property('car');
									res.body.car.should.have.property('owner');
									done();
								});
							});
						});
					});
				});
			});
	    });
/*
	  	it('it should GET user information, including cars', function(done) {
			this.timeout(15000);
			
			usersAPI.clearUsersTable()
			.then( function(fulfilled){
				chai.request(baseUrl)
				.get('/servers/initAndWriteDummyServer/')
				.end((err,res) => {
					var token = res.body.serverToken;
					chai.request(baseUrl)
					.post('/users/')
					.set(token_header_flag, token)
					.send(user)
					.end((err, res) => {

						usersAPI.clearCarsTable()
						.then( function(fulfilled){
							chai.request(baseUrl)
							.post('/users/' + user.id + '/cars/')
							.set(token_header_flag, token)
							.send(car)
							.end((err, res) => {
								console.log(car);
								res.should.have.status(201);
								chai.request(baseUrl)
								.get('/users/' + user.id)
								.set(token_header_flag, token)
								.end((err, res) => {
									
									console.log(res.body.Car + '\n\n');
									// TODO aca tienen que mostrarse los autos
									res.should.have.status(200);
									done();
								});
							});
						});
					});
				});
			});
	    });
*/
	});

	describe('/DELETE users car', function() {

		var user = {
			_ref: 'aaa',
			type: 'conductor',
			username: 'johnny',
			password: 'aaaa',
			firstName: 'John',
			lastName: 'Hancock',
			country: 'Argentina',
			email: 'johnny123@gmail.com',
			birthdate: '24/05/1992'
		};

		var userId = 1;

		var car = {
		    "id": 25,
		    "_ref": "hola",
		    "owner": userId, 
		    "properties": [{"name": "Ecosport", "value": "autito"}, {"name": "Fiesta", "value": "autito2"}]
		};

	  	it('it should DELETE existing car from user', function(done) {
			this.timeout(15000);
			
			usersAPI.clearUsersTable()
			.then( function(fulfilled){
				serversAPI.clearServersTable()
				.then(function(fulfilled) {
					chai.request(baseUrl)
					.get('/servers/initAndWriteDummyServer/')
					.end((err,res) => {
						var token = res.body.serverToken;

						chai.request(baseUrl)
						.post('/users/')
						.set(token_header_flag, token)
						.send(user)
						.end((err, res) => {
							res.body.should.have.property('user');
							usersAPI.clearCarsTable()
							.then( function(fulfilled){

								chai.request(baseUrl)
								.post('/users/' + userId + '/cars/')
								.set(token_header_flag, token)
								.send(car)
								.end((err, res) => {
									res.should.have.status(201);
									
									chai.request(baseUrl)
									.delete('/users/' + userId + '/cars/' + car.id)
									.set(token_header_flag, token)
									.end((err, res) => {
										res.should.have.status(204);
										done();
									});
								});
							});
						});
					});
				});
			});
	    });

	  	it('it shouldn\'t DELETE a car that doesn\'t exist', function(done) {
			this.timeout(15000);
			
			usersAPI.clearUsersTable()
			.then( function(fulfilled){
				serversAPI.clearServersTable()
				.then(function(fulfilled) {
					chai.request(baseUrl)
					.get('/servers/initAndWriteDummyServer/')
					.end((err,res) => {
						var token = res.body.serverToken;
						chai.request(baseUrl)
						.post('/users/')
						.set(token_header_flag, token)
						.send(user)
						.end((err, res) => {
							res.body.should.have.property('user');
							usersAPI.clearCarsTable()
							.then( function(fulfilled){							
								chai.request(baseUrl)
								.delete('/users/' + userId + '/cars/' + car.id)
								.set(token_header_flag, token)
								.end((err, res) => {
									res.should.have.status(404);
									done();
								});	
							});
						});
					});
				});
			});
	    });
	});

	describe('/GET users specific car', function() {

		var user = {
			_ref: 'aaa',
			type: 'conductor',
			username: 'johnny',
			password: 'aaaa',
			firstName: 'John',
			lastName: 'Hancock',
			country: 'Argentina',
			email: 'johnny123@gmail.com',
			birthdate: '24/05/1992'
		};

		var userId = 1;

		var car = {
		    "id": 25,
		    "_ref": "hola",
		    "owner": 1, 
		    "properties": [{"name": "Ecosport", "value": "autito"}, {"name": "Fiesta", "value": "autito2"}]
		};

	  	it('it should GET a specific car from specific user', function(done) {
			this.timeout(15000);
			
			usersAPI.clearUsersTable()
			.then( function(fulfilled){
				serversAPI.clearServersTable()
				.then(function(fulfilled) {
					chai.request(baseUrl)
					.get('/servers/initAndWriteDummyServer/')
					.end((err,res) => {
						var token = res.body.serverToken;
						chai.request(baseUrl)
						.post('/users/')
						.set(token_header_flag, token)
						.send(user)
						.end((err, res) => {
							res.body.should.have.property('user');
							usersAPI.clearCarsTable()
							.then( function(fulfilled){
								chai.request(baseUrl)
								.post('/users/' + userId + '/cars/')
								.set(token_header_flag, token)
								.send(car)
								.end((err, res) => {
									res.should.have.status(201);
									chai.request(baseUrl)
									.get('/users/' + userId + '/cars/' + car.id)
									.set(token_header_flag, token)
									.end((err, res) => {
										res.should.have.status(200);
										res.body.should.have.property('car');
										res.body.car.owner.should.equal(userId.toString());
										done();
									});
								});
							});
						});
					});
				});
			});
	    });

	  	it('it shouldn\'t GET a missing car from specific user', function(done) {
			this.timeout(15000);
			
			usersAPI.clearUsersTable()
			.then( function(fulfilled){
				serversAPI.clearServersTable()
				.then(function(fulfilled) {			
					chai.request(baseUrl)
					.get('/servers/initAndWriteDummyServer/')
					.end((err,res) => {
						var token = res.body.serverToken;
						chai.request(baseUrl)
						.post('/users/')
						.set(token_header_flag, token)
						.send(user)
						.end((err, res) => {
							res.body.should.have.property('user');
							usersAPI.clearCarsTable()
							.then( function(fulfilled){

								chai.request(baseUrl)
								.post('/users/' + userId + '/cars/')
								.set(token_header_flag, token)
								.send(car)
								.end((err, res) => {
									res.should.have.status(201);
									chai.request(baseUrl)
									.get('/users/' + userId + '/cars/' + car.id + 1)
									.set(token_header_flag, token)
									.end((err, res) => {
										res.should.have.status(404);
										done();
									});
								});
							});
						});
					});
				});
			});
	    });
	});

	describe('/PUT users car', function() {
	  	it('it shouldn\'t PUT a missing car', function(done) {
			this.timeout(15000);
			
			usersAPI.clearUsersTable()
			.then( function(fulfilled){
				serversAPI.clearServersTable()
				.then(function(fulfilled) {
					var user = {
						_ref: 'aaa',
						type: 'conductor',
						username: 'johnny',
						password: 'aaaa',
						firstName: 'John',
						lastName: 'Hancock',
						country: 'Argentina',
						email: 'johnny123@gmail.com',
						birthdate: '24/05/1992'
					};

					var userId = 1;
					
					chai.request(baseUrl)
					.get('/servers/initAndWriteDummyServer/')
					.end((err,res) => {
						
						console.log('Is this body w token?: ', res.body);
						var token = res.body.serverToken;

						chai.request(baseUrl)
						.post('/users/')
						.set(token_header_flag, token)
						.send(user)
						.end((err, res) => {
							res.body.should.have.property('user');
							var car = {
							    "id": 25,
							    "_ref": "hola",
							    "owner": 1, 
							    "properties": [{"name": "Ecosport", "value": "autito"}, {"name": "Fiesta", "value": "autito2"}]
							}
							usersAPI.clearCarsTable()
							.then( function(fulfilled){							
								chai.request(baseUrl)
								.put('/users/' + userId + '/cars/' + car.id)
								.send(car)
								.set(token_header_flag, token)
								.end((err, res) => {
									res.should.have.status(404);
									done();
								});
							});
						});
					});
				});
			});
	    });

	  	it('it should PUT an existing car', function(done) {
			this.timeout(15000);
			
			usersAPI.clearUsersTable()
			.then( function(fulfilled){
				serversAPI.clearServersTable()
				.then(function(fulfilled) {
					var user = {
						_ref: 'aaa',
						type: 'conductor',
						username: 'johnny',
						password: 'aaaa',
						firstName: 'John',
						lastName: 'Hancock',
						country: 'Argentina',
						email: 'johnny123@gmail.com',
						birthdate: '24/05/1992'
					};

					var userId = 1;
					
					chai.request(baseUrl)
					.get('/servers/initAndWriteDummyServer/')
					.end((err,res) => {
						
						console.log('Is this body w token?: ', res.body);
						var token = res.body.serverToken;

						chai.request(baseUrl)
						.post('/users/')
						.set(token_header_flag, token)
						.send(user)
						.end((err, res) => {
							res.body.should.have.property('user');
							var car = {
							    "id": 25,
							    "_ref": "hola",
							    "owner": userId, 
							    "properties": [{"name": "Ecosport", "value": "autito"}, {"name": "Fiesta", "value": "autito2"}]
							}
							usersAPI.clearCarsTable()
							.then( function(fulfilled){		
								chai.request(baseUrl)
								.post('/users/' + userId + '/cars/')
								.set(token_header_flag, token)
								.send(car)		
								.end((err, res) => {			
									chai.request(baseUrl)
									.put('/users/' + userId + '/cars/' + car.id)
									.send(car)
									.set(token_header_flag, token)
									.end((err, res) => {
										res.should.have.status(200);
										res.body.should.have.property('car');
										done();
									});
								});
							});
						});
					});
				});
			});
	    });
	});
});
