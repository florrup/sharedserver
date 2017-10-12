//! @package test
//! @file users.js

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

var usersAPI = require('../routes/users');
var jwt = require('jsonwebtoken');

/**
 *  Test methods for application users endpoints
 *
 * Application users are the drivers or passangers that use the system and have a profile in this database
 */
describe('Users', function()  {

	describe('/GET users', function() {
	  	it('it should GET no users from empty database', function(done) {
		    this.timeout(20000);
		    usersAPI.clearUsersTable()
			.then( function(fulfilled){

				chai.request(baseUrl)
				.get('/business-users/initAndWriteDummyBusinessUser/') 
				.end((err, res) => {
					chai.request(baseUrl)
					.post('/token/')
					.set('content-type', 'application/json')
					.send({"BusinessUserCredentials":{"username":"johnny", "password":"aaa"}})
					.end((err, res) => {
						console.log('Is this body w token?: ', res.body);
						var token = res.body.token.token;

						chai.request(baseUrl)
						.get('/users/')
						.set(token_header_flag, token)
						.end((err, res) => {
							res.should.have.status(200);
							res.body.should.be.a('array');
							res.body.length.should.be.eql(0);
							done();
						});
					});
				});
			});
	    });
	});

	describe('/POST user', function() {
	  	it('it should POST a user', function(done) {
			this.timeout(15000);
	  		usersAPI.clearUsersTable().
			then( function(fulfilled){

				var newUser = {
					id: 0,
					username: 'johnny',
					password: 'aaaa',
					name: 'John',
					surname: 'Hancock',
					country: 'Argentina',
					email: 'johnny123@gmail.com',
					birthdate: '24/05/1992'
				};

				chai.request(baseUrl)
				.get('/servers/initAndWriteDummyServer/') 
				.end((err, res) => {
					
					console.log('Is this body w token?: ', res.body);
					var token = res.body.serverToken;

					chai.request(baseUrl)
					.post('/users/')
					.set(token_header_flag, token)
					.send(newUser)
					.end((err, res) => {
						res.should.have.status(201);
						res.body.should.have.property('surname');
						res.body.should.have.property('id');
					  done();
					});
				});
			});
	    });
	});

	var userToDelete = {
		id: 15,
		username: 'testUsername',
		password: 'fakepasswd',
		name: 'testName',
		surname: 'testSurname',
		country: 'Argentina',
		email: 'testEmail@gmail.com',
		birthdate: '24/05/1992'
	};

	describe('/DELETE user', function() {
		it('it shouldn\'t DELETE a user that doesn\'t exist', function(done) {
			this.timeout(15000);
	  		usersAPI.clearUsersTable().
			then( function(fulfilled){
				chai.request(baseUrl)
				.get('/business-users/initAndWriteDummyBusinessUser/')
				.end((err,res) => {

					chai.request(baseUrl)
					.post('/token/')
					.set('content-type', 'application/json')
					.send({"BusinessUserCredentials":{"username":"johnny", "password":"aaa"}})
					.end((err, res) => {
						console.log('Is this body w token?: ', res.body);
						var token = res.body.token.token;

						chai.request(baseUrl)
						.delete('/users/' + userToDelete.id)
						.set(token_header_flag, token)
						.send(userToDelete)
						.end((err, res) => {
							res.should.have.status(404);
							done();
						});
					});
				});
			});
		});

	  	it('it should DELETE a user', function(done) {
			this.timeout(15000);
	  		usersAPI.clearUsersTable().
			then( function(fulfilled){
				chai.request(baseUrl)
				.get('/servers/initAndWriteDummyServer/')
				.end((err,res) => {
				
					console.log('Is this body w token?: ', res.body);
					var token = res.body.serverToken;

					chai.request(baseUrl)
					.post('/users/')
					.set(token_header_flag, token)
					.send(userToDelete)
					.end((err, res) => {
						chai.request(baseUrl)
						.delete('/users/' + userToDelete.id)
						.set(token_header_flag, token)
						.send(userToDelete)
						.end((err, res) => {
							res.should.have.status(204);
							done();
						});
					});					
				});
			});
	    });
	});

	describe('/GET user', function() {
	  	it('it should GET an existing user', function(done) {
			this.timeout(15000);
			
			usersAPI.clearUsersTable().
			then( function(fulfilled){

				var userToGet = {
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
				.get('/business-users/initAndWriteDummyBusinessUser/')
				.end((err,res) => {
	
					chai.request(baseUrl)
					.post('/token/')
					.set('content-type', 'application/json')
					.send({"BusinessUserCredentials":{"username":"johnny", "password":"aaa"}})
					.end((err, res) => {

						console.log('Is this body w token?: ', res.body);
						var businessToken = res.body.token.token;

						chai.request(baseUrl)
						.get('/servers/initAndWriteDummyServer')
						.set(token_header_flag, businessToken)
						.end((err,res) => {
							res.should.have.status(200);
							var serverToken = res.body.serverToken;

							chai.request(baseUrl)
							.post('/users/')
							.set(token_header_flag, serverToken)
							.send(userToGet)
							.end((err, res) => {
								chai.request(baseUrl)
								.get('/users/' + userToGet.id)
								.set(token_header_flag, businessToken)
								.end((err, res) => {
									res.should.have.status(200);
									done();
								});
							});
						});
					});
				});
			});
	    });

	  	it('it shouldn\'t GET a user that doesn\'t exist', function(done) {
			this.timeout(15000);
			
			usersAPI.clearUsersTable().
			then( function(fulfilled){

				var userToGet = {
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
				.get('/business-users/initAndWriteDummyBusinessUser/')
				.end((err,res) => {
	
					chai.request(baseUrl)
					.post('/token/')
					.set('content-type', 'application/json')
					.send({"BusinessUserCredentials":{"username":"johnny", "password":"aaa"}})
					.end((err, res) => {

						console.log('Is this body w token?: ', res.body);
						var businessToken = res.body.token.token;
						
						chai.request(baseUrl)
						.get('/users/' + userToGet.id)
						.set(token_header_flag, businessToken)
						.end((err, res) => {
							res.should.have.status(404);
							res.body.should.have.property('code');
							done();
						});						
					});
				});
			});
	    });
	});

	describe('/GET user with INVALIDATED TOKEN', function() {
	  	it('it should NOT GET an existing user with INVALIDATED TOKEN', function(done) {
			this.timeout(20000);
			
			usersAPI.clearUsersTable().
			then( function(fulfilled){

				var userToGet = {
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
				.get('/business-users/initAndWriteDummyBusinessUser/')
				.end((err,res) => {
					res.should.have.status(200);
					
					chai.request(baseUrl)
					.get('/servers/initAndWriteDummyServer/')
					.end((err,res) => {
						res.should.have.status(200);
						var oldAppToken = res.body.serverToken;
						//console.log('Is this body OLD APP TOKEN inside JSON?: ', res.body);
						chai.request(baseUrl)
						.post('/token/')
						.set('content-type', 'application/json')
						.send({"BusinessUserCredentials":{"username":"johnny", "password":"aaa"}})
						.end((err, res) => {
							res.should.have.status(201);
							var businessUserToken = res.body.token.token;
							chai.request(baseUrl)
							.post('/users/')
							.set(token_header_flag, oldAppToken)
							.send(userToGet)
							.end((err, res) => {
								res.should.have.status(201);
								
								// Taking a small nap to let newToken and oldToken be different in time
								console.log('Freezing for 2 senconds to make tokens differ in end time...');
								var milliseconds = 2000;
								var start = new Date().getTime();
								for (var i = 0; i < 1e7; i++) {
									if ((new Date().getTime() - start) > milliseconds){
									  break;
									}
								}
								console.log('TOKENNN: ' + oldAppToken);
								chai.request(baseUrl)
								.post('/servers/ping/')
								.set(token_header_flag, oldAppToken) // here still oldAppToken is OK
								.end((err, res) => {
									/// \todo averiguar por que a veces salta 401 unaothorized acá...
									/// El error que leemos del token es que está vencido
									/// Podría ser un tema de la definición de tiempo en chai mocha testing
									/// Autenticación por token es usado en todos los demás tests y no anda mal
									/// En este test lo que queremos probar es otra cosa:
									/// Si para este método el token aún es válido (en un escenario real debería serlo)
									/// La anulación del token funciona correctamente. Si en cambio el token expira
									/// como se mencionó este test llega hasta acá y termina con error 401
									res.should.have.status(200);
									var newAppToken = res.body.ping.token.token;
									jwt.verify(newAppToken, process.env.TOKEN_SECRET_KEY, function (err, decoded) {
										// console.log('TOKEN DECODED: '+JSON.stringify(decoded));
										chai.request(baseUrl)
										.get('/users/' + userToGet.id)
										.set(token_header_flag, oldAppToken) // oldAppToken has been invalidated
										.end((err, res) => {
											res.should.have.status(401); // unauthorized
											chai.request(baseUrl)
											.get('/users/' + userToGet.id)
											.set(token_header_flag, newAppToken) // newAppToken should be ok
											.end((err, res) => {
												res.should.have.status(200);
												done();
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
	});

	var userToModify = {
		id: 11,
		username: 'testUsername11',
		password: 'aaa',
		name: 'testName11',
		surname: 'testSurname11',
		country: 'Argentina11',
		email: 'testEmail11@gmail.com',
		birthdate: '24/05/1992'
	};

	describe('/PUT user', function() {

		it('it shouldnt PUT a user that doesnt exist', function(done) {
			this.timeout(15000);
			
			usersAPI.clearUsersTable().
			then( function(fulfilled){

				chai.request(baseUrl)
				.get('/servers/initAndWriteDummyServer/')
				.end((err,res) => {
				
					console.log('Is this body w token?: ', res.body);
					var token = res.body.serverToken;

					chai.request(baseUrl)
					.put('/users/' + userToModify.id)
					.set(token_header_flag, token)
					.send(userToModify)
					.end((err, res) => {
						res.should.have.status(404);
						done();
					});	
				});
			});
	    });

	  	it('it should PUT a modified user', function(done) {
			this.timeout(15000);
			
			usersAPI.clearUsersTable().
			then( function(fulfilled){

				var userToModify = {
					id: 11,
					username: 'testUsername11',
					name: 'testName11',
					surname: 'testSurname11',
					country: 'Argentina11',
					email: 'testEmail11@gmail.com',
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
					.send(userToModify)
					.end((err, res) => {
						userToModify = {
							id: 11,
							username: 'modifiedUsername',
							name: 'testName11',
							surname: 'testSurname11',
							country: 'Argentina11',
							email: 'testEmail11@gmail.com',
							birthdate: '24/05/1992'
						};			

						chai.request(baseUrl)
						.put('/users/' + userToModify.id)
						.set(token_header_flag, token)
						.send(userToModify)
						.end((err, res) => {
							res.should.have.status(200);
							res.body.username.should.equal('modifiedUsername');
							done();
						});
					});
					
				});
			});
	    });
	});

	describe('/VALIDATE user', function() {
	  	it('it should VALIDATE an existing user', function(done) {
			this.timeout(15000);
			
			usersAPI.clearUsersTable()
			.then( function(fulfilled){

				var userToValidate = {
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
					.send(userToValidate)
					.end((err, res) => {
						res.body.should.have.property('username');
						console.log('Server has been created\n');
						chai.request(baseUrl)
						.post('/users/validate')
						.set(token_header_flag, token)
						.send({"username":"testUsername10", "password":"aaa"})
						.end((err, res) => {
							res.should.have.status(200);
							done();
						});
					});
				});
			});
	    });

	  	it('it shouldn\'t VALIDATE an user that doesn\'t exist', function(done) {
			this.timeout(15000);
			
			usersAPI.clearUsersTable()
			.then( function(fulfilled){
				
				chai.request(baseUrl)
				.get('/servers/initAndWriteDummyServer/')
				.end((err,res) => {
					
					console.log('Is this body w token?: ', res.body);
					var token = res.body.serverToken;

					chai.request(baseUrl)
					.post('/users/validate')
					.set(token_header_flag, token)
					.send({"username":"testUsername10", "password":"aaa"})
					.end((err, res) => {
						res.should.have.status(400);
						done();
					});
				});
			});
	    });
	});
});

/**
 *  Test methods for application servers management endpoints
 *
 * Servers or application servers are the programs that run the system and operate with the client applications run by application users
 * These methods test endpoints for servers management
 */
 describe('Servers', function()  {

	var serversAPI = require('../routes/servers');

	describe('/GET servers', function() {
	  	it('it should have no permission to access servers without token', function(done) {
		    this.timeout(15000);
		    serversAPI.clearServersTable()
			.then( function(fulfilled){
				chai.request(baseUrl)
					.get('/servers/')
					.end((err, res) => {
						res.should.have.status(401);
						done();
					});
			});
	    });

	    it('it should GET a server', function(done) {
			this.timeout(15000);

			serversAPI.clearServersTable()
			.then( function(fulfilled){
				
				chai.request(baseUrl)
				.post('/token/')
				.set('content-type', 'application/json')
				.send({"BusinessUserCredentials":{"username":"johnny", "password":"aaa"}})
				.end((err, res) => {
					console.log('Is this body w token?: ', res.body);
					var token = res.body.token.token;

					var serverToGet = {
						id: 12,
						_ref: 'abc12',
						createdBy: 12,
						createdTime: 'testTime12',
						name: 'Test12',
						lastConnection: 12,
						username: 'myAppServer',
						password: 'aa'
					};

					chai.request(baseUrl)
						.post('/servers/')
						.set(token_header_flag, token)
						.send(serverToGet)
						.end((err, res) => {
							chai.request(baseUrl)
								.get('/servers/' + serverToGet.id)
								.set(token_header_flag, token)
								.end((err, res) => {
									res.should.have.status(200);
									done();
								});
						});
				});
			});
	    });
	});

	describe('/POST server', function() {
	  	it('it should POST a server', function(done) {
			this.timeout(15000);

	  		serversAPI.clearServersTable()
			.then( function(fulfilled){

			chai.request(baseUrl)
				.post('/token/')
				.set('content-type', 'application/json')
				.send({"BusinessUserCredentials":{"username":"johnny", "password":"aaa"}})
				.end((err, res) => {
					console.log('Is this body w token?: ', res.body);
					var token = res.body.token.token;

					var newServer = {
						id: 10,
						_ref: 'abc10',
						createdBy: 10,
						createdTime: 'abc10',
						name: 'Dummy10',
						lastConnection: 10,
						username: 'myAppServer'
					};

					chai.request(baseUrl)
						.post('/servers/')
						.set(token_header_flag, token)
						.send(newServer)
						.end((err, res) => {
							res.should.have.status(201);
							res.body.should.have.property('metadata');
							res.body.should.have.property('server');
							res.body.should.have.property('token');
						  done();
						});
					});
			});
	    });
	 });

	describe('/DELETE server', function() {
	  	it('it should DELETE a server', function(done) {
	  		this.timeout(15000);
	  		serversAPI.clearServersTable()
			.then( function(fulfilled){
				
				chai.request(baseUrl)
				.post('/token/')
				.set('content-type', 'application/json')
				.send({"BusinessUserCredentials":{"username":"johnny", "password":"aaa"}})
				.end((err, res) => {
					console.log('Is this body w token?: ', res.body);
					var token = res.body.token.token;

					var serverToDelete = {
						id: 11,
						_ref: 'abc11',
						createdBy: 11,
						createdTime: 'testTime11',
						name: 'Test11',
						lastConnection: 11,
						username: 'myAppServer'
					};

					chai.request(baseUrl)
					.post('/servers/')
					.set(token_header_flag, token)
					.send(serverToDelete)
					.end((err, res) => {
						chai.request(baseUrl)
						.delete('/servers/' + serverToDelete.id)
						.set(token_header_flag, token)
						.send(serverToDelete)
						.end((err, res) => {
							res.should.have.status(204);
							done();
						});
					});
				});
			});
	    });

	  	it('it shouldn\'t DELETE a server that doesn\'t exist', function(done) {
	  		this.timeout(15000);
	  		serversAPI.clearServersTable()
			.then( function(fulfilled){
				
				chai.request(baseUrl)
				.post('/token/')
				.set('content-type', 'application/json')
				.send({"BusinessUserCredentials":{"username":"johnny", "password":"aaa"}})
				.end((err, res) => {
					console.log('Is this body w token?: ', res.body);
					var token = res.body.token.token;

					var serverToDelete = {
						id: 11,
						_ref: 'abc11',
						createdBy: 11,
						createdTime: 'testTime11',
						name: 'Test11',
						lastConnection: 11,
						username: 'myAppServer'
					};

					chai.request(baseUrl)
					.delete('/servers/' + serverToDelete.id)
					.set(token_header_flag, token)
					.send(serverToDelete)
					.end((err, res) => {
						res.should.have.status(404);
						done();
					});
		
				});
			});
	    });
	});

	describe('/PUT server', function() {
	  	it('it should PUT a server', function(done) {
			this.timeout(15000);

			var serverToPost = {
				id: 12,
				_ref: 'abc12',
				createdBy: 12,
				createdTime: 'testTime12',
				name: 'Test12',
				lastConnection: 12,
				username: 'myAppServer',
				password: 'aa'
			};

			serversAPI.clearServersTable()
			.then( function(fulfilled){
				chai.request(baseUrl)
				.get('/business-users/initAndWriteDummyBusinessUser/')
				.end((err,res) => {

					chai.request(baseUrl)
					.post('/token/')
					.set('content-type', 'application/json')
					.send({"BusinessUserCredentials":{"username":"johnny", "password":"aaa"}})
					.end((err, res) => {
						console.log('Is this body w token?: ', res.body);
						var token = res.body.token.token;
						chai.request(baseUrl)
						.post('/servers/')
						.set(token_header_flag, token)
						.send(serverToPost)
						.end((err, res) => {

							serverToPost = {
								id: 12,
								_ref: 'abc12',
								createdBy: 12,
								createdTime: 'testTime12',
								name: 'ModifiedName',
								lastConnection: 12,
								username: 'myAppServer',
								password: 'aa'
							};

							chai.request(baseUrl)
							.put('/servers/' + serverToPost.id)
							.set(token_header_flag, token)
							.send(serverToPost)
							.end((err, res) => {

								chai.request(baseUrl)
								.get('/servers/' + serverToPost.id)
								.set(token_header_flag, token)
								.end((err, res) => {
									res.should.have.status(200);
									console.log(res.body);
									res.body.name.should.equal('ModifiedName');
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

/**
 *  Test methods for business users management endpoints
 *
 * Business users are the persons that manage the system with different levels of authorization
 * These methods test endpoints for business users management
 */
describe('BusinessUsers', function()  {

	var businessUsersAPI = require('../routes/business-users');

	describe('/GET business user', function() {
	  	it('it should GET business users from database', function(done) {
		    this.timeout(15000);
		    businessUsersAPI.clearBusinessUsersTable()
			.then( function(fulfilled){
				
				chai.request(baseUrl)
				.get('/business-users/initAndWriteDummyBusinessUser/') 
				.end((err, res) => {

					chai.request(baseUrl)
					.post('/token/')
					.set('content-type', 'application/json')
					.send({"BusinessUserCredentials":{"username":"johnny", "password":"aaa"}})
					.end((err, res) => {
						console.log('Is this body w token?: ', res.body);
						var token = res.body.token.token;

						chai.request(baseUrl)
						.get('/business-users/')
						.set(token_header_flag, token)
						.end((err, res) => {
							res.should.have.status(200);
							res.body.should.be.a('array');
							res.body.length.should.be.eql(1);
							done();
						});
					});				
				});
			});
	    });
	});

	describe('/POST business user', function() {
	  	it('it should POST a business user', function(done) {
			this.timeout(15000);

	  		businessUsersAPI.clearBusinessUsersTable()
			.then( function(fulfilled){

				var newBusinessUser = {
				    id: 2,
				    _ref: 'a2',
				    username: 'carlossanchez',
				    password: 'carlos123',
				    name: 'Carlos',
				    surname: 'Sanchez',
					roles: ['admin', 'user']
				};

				chai.request(baseUrl)
				.get('/business-users/initAndWriteDummyBusinessUser/') 
				.end((err, res) => {

					chai.request(baseUrl)
					.post('/token/')
					.set('content-type', 'application/json')
					.send({"BusinessUserCredentials":{"username":"johnny", "password":"aaa"}})
					.end((err, res) => {
						console.log('Is this body w token?: ', res.body);
						var token = res.body.token.token;

						chai.request(baseUrl)
						.post('/business-users/')
						.set(token_header_flag, token)
						.send(newBusinessUser)
						.end((err, res) => {
							res.should.have.status(201);
							res.body.should.have.property('username');
							res.body.should.have.property('surname');
						  done();
						});

					});				
				});
			});
	    });
	});

	describe('/DELETE business user', function() {
	  	it('it should DELETE a business user', function(done) {
	  		this.timeout(15000);
	  		businessUsersAPI.clearBusinessUsersTable()
			.then( function(fulfilled){

				var businessUserToDelete = {
				    id: 3,
				    _ref: 'a3',
				    username: 'johnBlack',
				    name: 'John',
				    surname: 'Black',
					roles: ['admin', 'user']
				};

				chai.request(baseUrl)
				.get('/business-users/initAndWriteDummyBusinessUser/') 
				.end((err, res) => {

					chai.request(baseUrl)
					.post('/token/')
					.set('content-type', 'application/json')
					.send({"BusinessUserCredentials":{"username":"johnny", "password":"aaa"}})
					.end((err, res) => {
						console.log('Is this body w token?: ', res.body);
						var token = res.body.token.token;

						chai.request(baseUrl)
						.post('/business-users/')
						.set(token_header_flag, token)
						.send(businessUserToDelete)
						.end((err, res) => {
							chai.request(baseUrl)
								.delete('/business-users/' + businessUserToDelete.id)
								.set(token_header_flag, token)
								.send(businessUserToDelete)
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

	describe('/PUT business user', function() {

		var businessuserToModify = {
		    id: 3,
		    _ref: 'a3',
		    username: 'johnBlack',
		    password: 'abc',
		    name: 'John',
		    surname: 'Black',
			roles: ['user']
		};

		it('it shouldn\'t PUT a business user that doesnt exist', function(done) {
	  		this.timeout(15000);
	  		businessUsersAPI.clearBusinessUsersTable()
			.then( function(fulfilled){

				chai.request(baseUrl)
				.get('/business-users/initAndWriteDummyBusinessUser/') 
				.end((err, res) => {

					chai.request(baseUrl)
					.post('/token/')
					.set('content-type', 'application/json')
					.send({"BusinessUserCredentials":{"username":"johnny", "password":"aaa"}})
					.end((err, res) => {
						console.log('Is this body w token?: ', res.body);
						var token = res.body.token.token;

						chai.request(baseUrl)
						.post('/business-users/')
						.set(token_header_flag, token)
						.send(businessuserToModify)
						.end((err, res) => {
							businessuserToModify = {
							    id: 3,
							    _ref: 'a3',
							    username: 'johnBlack',
							    password: 'abc',
							    name: 'Tom',
							    surname: 'White',
								roles: ['user']
							};
							chai.request(baseUrl)
							.put('/business-users/' + businessuserToModify.id)
							.set(token_header_flag, token)
							.send(businessuserToModify)
							.end((err, res) => {
								res.should.have.status(200);
								res.body.username.should.equal('johnBlack');
								res.body.name.should.equal('Tom');
								done();
							});
						});

					});				
				});
			});
	    });
	});
});
