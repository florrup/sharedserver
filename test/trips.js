process.env.DATABASE_URL = 'postgres://nvvgpxztxxdugy:794bac95662fe3643cd76663cac5d8aab38e124878b513e5a796068e9ebbe281@ec2-23-23-234-118.compute-1.amazonaws.com:5432/de2pgllaiv55c3';
/*
process.env.DATABASE_USER='nvvgpxztxxdugy';
process.env.DATABASE_HOST='ec2-23-23-234-118.compute-1.amazonaws.com';
process.env.DATABASE='de2pgllaiv55c3';
process.env.DATABASE_PASS='794bac95662fe3643cd76663cac5d8aab38e124878b513e5a796068e9ebbe281';
*/
/*
process.env.DATABASE_USER='yvnmgtvwznipcx';
process.env.DATABASE_HOST='ec2-184-73-249-56.compute-1.amazonaws.com';
process.env.DATABASE='d2gv0cr5bou448';
process.env.DATABASE_PASS='d2158d028efa41843d2788c28396c02b4bb47b9e2b0c207ad99f1c1dc266466e';
*/
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
 *  Test methods for trips management endpoints
 */
describe('Trips', function()  {

	var tripsAPI = require('../routes/trips');

	describe('/GET Trips', function() {
		
		it('it should have no permission to access servers without token', function(done) {
			this.timeout(15000);
			chai.request(baseUrl)
				.get('/servers/initAndWriteDummyServer/') 
				.end((err, res) => {
					// serversAPI.clearTripsTable()
					//.then( function(fulfilled){
					chai.request(baseUrl)
						.get('/trips/')
						.end((err, res) => {
							res.should.have.status(401);
							done();
						});
				});
		});
	});
	
	describe('/POST estimate', function() {
	  	it('it should POST to estimate a trip', function(done) {
			this.timeout(15000);
			
			chai.request(baseUrl)
			.get('/servers/initAndWriteDummyServer/')
			.end((err,res) => {
				var serverToken = res.body.serverToken;
				chai.request(baseUrl)
				.get('/business-users/initAndWriteDummyBusinessUser/') 
				.end((err, res) => {

					chai.request(baseUrl)
					.post('/token/')
					.set('content-type', 'application/json')
					.send({"BusinessUserCredentials":{"username":"johnny", "password":"aaa"}})
					.end((err, res) => {
						var businessUserToken = res.body.token.token;

						chai.request(baseUrl)
						.get('/rules/dropRuleTable')
						.set(token_header_flag, businessUserToken)
						.end((err, res) => {
							var blob = {
								name: 'RuleNombrePrueba',
			                    condition: "function(R) { R.when(this.type == 'pasajero'); }",
			                    consequence: "function(R) { this.puedeViajar = true; this.costoPorKilometro = 15; this.reason = 'Probando prueba string'; R.stop(); }",
			                    priority: 2
			                };
							var rule = {
								_ref: 'abc', 
								language: 'node-rules/javascript', 
								blob: blob,
								active: true
							}
							chai.request(baseUrl)
							.post('/rules')
							.set(token_header_flag, businessUserToken)
							.send(rule)
							.end((err, res) => {
								var tripToEstimate = {
									passenger: 4,
									start: {
										address: {
											location: {
												lat: -34.803963,
												lon: -58.454125
											}
										}
									},
									end: {
										address: {
											location: {
												lat: -34.80198421544148,
												lon: -58.44340190291405
											}
										}
									}
								};
								
								chai.request(baseUrl)
								.post('/trips/estimate')
								.set(token_header_flag, serverToken)
								.send(tripToEstimate)
								.end((err, res) => {
									console.log('res:');
									console.log(res.body);
									res.should.have.status(200);
									done();
								});
							});
						});
					});
				});
			});
		});
	});
	
	describe('/POST trips', function() {
	  	it('it should POST a trip and make two payments and then get all trips and transactions from that user', function(done) {
			this.timeout(25000);
			var usersAPI = require('../routes/users');
			var serversAPI = require('../routes/servers');
			var tripsAPI = require('../routes/trips');
			
			usersAPI.clearUsersTable()
			.then(function(fulfilled) {
				tripsAPI.clearTripsTable()
				.then(function(fulfilled) {
					tripsAPI.clearTransactionsTable()
					.then(function(fulfilled) {
						serversAPI.clearServersTable()
						.then(function(fulfilled) {
							chai.request(baseUrl)
							.get('/servers/initAndWriteDummyServer/')
							.end((err,res) => {
								var token = res.body.serverToken;
								usersAPI.clearUsersTable()
								.then( function(fulfilled){
									var firstUser = {
											_ref: 'aaa',
											type: 'conductor',
											username: 'johnny',
											password: 'aaaa',
											fb: {
												userId: '',
												authToken: ''
											},
											firstName: 'John',
											lastName: 'Hancock',
											country: 'Argentina',
											email: 'johnny123@gmail.com',
											birthdate: '24/05/1992'
									};
									chai.request(baseUrl)
									.post('/users/')
									.set(token_header_flag, token)
									.send(firstUser)
									.end((err, res) => {
										console.log(res.body);
										res.should.have.status(201);
										var userId1 = res.body.user.id;
										// console.log('New User ID: '+userId1);
										var secondUser = {
												_ref: 'bbb',
												type: 'pasajero',
												username: 'tommy',
												password: 'bbbb',
												fb: {
													userId: '',
													authToken: ''
												},
												firstName: 'Tom',
												lastName: 'Smith',
												country: 'EEUU',
												email: 'tommy@gmail.com',
												birthdate: '29/01/1989'
										};
										chai.request(baseUrl)
										.post('/users/')
										.set(token_header_flag, token)
										.send(secondUser)
										.end((err, res) => {
											var userId2 = res.body.user.id;
											res.should.have.status(201);
											
											var tripParameters = {
												trip: {
													// id: 1, autoincremental local
													applicationOwner: '',
													driver: userId1,
													passenger: userId2,
													start: {
														address: {
															street: "Juncal 1234",
															location: {
																lat: -34.603722,
																lon: -58.381592
															}
														},
														timestamp: 9000000
													},
													end: {
														address: {
															street: "Malabia 4321",
															location: {
																lat: -34.603722,
																lon: -59.381592
															}
														},
														timestamp: 9002160
													},
													totalTime: 2160,
													waitTime: 360,
													travelTime: 1800,
													distance: 1500,
													route: 'Atajo'
													// cost:
												},
												paymethod:  {
													paymethod: 'card',
													parameters: {
														ccvv: 123,
														expiration_month: 10,
														expiration_year: 2018,
														number: '1234-5678-8765-4321',
														type: 'VISA'
													}
												}
											};
											chai.request(baseUrl)
											.post('/trips/')
											.set(token_header_flag, token)
											.send(tripParameters)
											.end((err, res) => {
												res.should.have.status(201);
												chai.request(baseUrl)
												.get('/trips/')
												.set(token_header_flag, token)
												.end((err, res) => {
													res.should.have.status(200);
													res.body.trips.length.should.be.eql(1);
													chai.request(baseUrl)
													.get('/users/'+userId1+'/transactions')
													.set(token_header_flag, token)
													.end((err, res) => {
														console.log('Transactions from User: '+userId1);
														console.log(res.body);
														res.should.have.status(200);
														res.body.transactions.length.should.be.eql(1);
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
			})
		});
	});
});