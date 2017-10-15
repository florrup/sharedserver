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

	describe('/GET users car', function() {
	  	it('it should GET no cars from user without cars', function(done) {
			this.timeout(15000);
			
			usersAPI.clearUsersTable()
			.then( function(fulfilled){

				var user = {
					id: 10,
					username: 'testUsername10',
					password: 'aaa',
					name: 'testName10',
					surname: 'testSurname10',
					country: 'Argentina10',
					email: 'testEmail10@gmail.com',
					birthdate: '24/05/1992'
				};
				
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
						res.body.should.have.property('username');

						chai.request(baseUrl)
						.get('/users/' + user.id + '/cars/')
						.set(token_header_flag, token)
						.end((err, res) => {
							console.log('Test body is: ' + res.body);
							res.should.have.status(200);
							res.body.should.be.a('array');
							done();
						});
					});
				});
			});
	    });

/*
	  	it('it should GET cars from existing user', function(done) {
			this.timeout(15000);
			
			usersAPI.clearUsersTable()
			.then( function(fulfilled){

				var user = {
					id: 10,
					username: 'testUsername10',
					password: 'aaa',
					name: 'testName10',
					surname: 'testSurname10',
					country: 'Argentina10',
					email: 'testEmail10@gmail.com',
					birthdate: '24/05/1992'
				};
				
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
						res.body.should.have.property('username');
						var car = {
						    "id": 25,
						    "_ref": "hola",
						    "owner": "Carlos", 
						    "properties": [{"name": "Ecosport", "value": "autito"}, {"name": "Fiesta", "value": "autito2"}],
						    "userId": 10
						}
						console.log('The user Id is: ' + user.id + '\n');
						console.log('Car user Id is: ' + car.user_id + ' ja\n');
						chai.request(baseUrl)
						.post('/users/' + user.id + '/cars/')
						.set(token_header_flag, token)
						.send(car)
						.end((err, res) => {
							console.log(car);
							res.should.have.status(201);
							done();
						});
					});
				});
			});
	    });
*/
	});
});
