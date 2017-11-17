//! @package test
//! @file rules.js

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
var R = require('../routes/rulesEngine.js');


chai.use(chaiHttp);

var jwt = require('jsonwebtoken');

/**
 *  Test methods for rules endpoints
 *
 */
describe('Rules', function()  {

	var rulesAPI = require('../routes/rules');
	var businessUsersAPI = require('../routes/business-users');

	describe('/GET rules', function() {
	  	it('it shouldn\'t GET rules from empty database table', function(done) {
			this.timeout(15000);

			businessUsersAPI.clearBusinessUsersTable()
			.then(function(fulfilled) {
				chai.request(baseUrl)
				.get('/business-users/initAndWriteDummyBusinessUser/') 
				.end((err, res) => {

					chai.request(baseUrl)
					.post('/token/')
					.set('content-type', 'application/json')
					.send({"BusinessUserCredentials":{"username":"johnny", "password":"aaa"}})
					.end((err, res) => {
						var token = res.body.token.token;
						chai.request(baseUrl)
						.get('/rules/dropRuleTable')
						.set(token_header_flag, token)
						.end((err, res) => {
							res.should.have.status(200);
							chai.request(baseUrl)
							.get('/rules/')
							.set(token_header_flag, token)
							.end((err,res) => {
								res.should.have.status(200);
								res.body.rules.length.should.be.eql(0);
								done();
							});
						});
					});
				});
	    	});
	    });

	   	it('it should GET a specific rule', function(done) {
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
						var token = res.body.token.token;

						chai.request(baseUrl)
						.get('/rules/dropRuleTable')
						.set(token_header_flag, token)
						.end((err, res) => {
							var blob = {
									name: 'RuleNombrePrueba',
				                    condition: "function(R) { R.when(this.type == 'pasajero'); }",
				                    consequence: "function(R) { this.puedeViajar = true; this.reason = 'Probando delete rule'; R.stop(); }",
				                    priority: 2};
							var rule = {
								_ref: 'abc', 
								language: 'node-rules/javascript', 
								blob: blob,
								active: true
							}
							chai.request(baseUrl)
							.post('/rules')
							.set(token_header_flag, token)
							.send(rule)
							.end((err, res) => {
								res.should.have.status(201);

								chai.request(baseUrl)
								.get('/rules/' + blob.name)
								.set(token_header_flag, token)
								.end((err,res) => {
									res.should.have.status(200);
									res.body.should.have.property('metadata');
									res.body.should.have.property('rule');
									res.body.rule.should.have.property('blob');
									done();
								});
							});
						});
					});				
				});
			});
	    });
	});

	describe('/POST rules', function() {
	   	it('it shouldn\'t POST a rule with missing parameters', function(done) {
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
						var token = res.body.token.token;

						chai.request(baseUrl)
						.get('/rules/dropRuleTable')
						.set(token_header_flag, token)
						.end((err, res) => {
							var rule = {
								_ref: 'abc', 
								language: 'node-rules/javascript', 
								// missing blob
								active: true
							}

							chai.request(baseUrl)
							.post('/rules/')
							.set(token_header_flag, token)
							.send(rule)
							.end((err, res) => {
								res.should.have.status(400);
								res.body.should.have.property('code');
								done();
							});
						});
					});				
				});
			});
	    });

	   	it('it should POST a rule', function(done) {
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
						var token = res.body.token.token;

						chai.request(baseUrl)
						.get('/rules/dropRuleTable')
						.set(token_header_flag, token)
						.end((err, res) => {
							var blob = {
								name: 'RuleNombrePrueba',
			                    condition: "function(R) { R.when(this.type == 'pasajero'); }",
			                    consequence: "function(R) { this.puedeViajar = true; this.reason = 'Probando prueba string'; R.stop(); }",
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
							.set(token_header_flag, token)
							.send(rule)
							.end((err, res) => {
								res.should.have.status(201);
								res.body.should.have.property('metadata');
								res.body.rule.should.have.property('id');
								res.body.rule.should.have.property('_ref');
								res.body.rule.should.have.property('language');
								res.body.rule.should.have.property('blob');
								res.body.rule.should.have.property('active');
								res.body.rule.should.have.property('lastCommit');

								console.log(res.body.rule.lastCommit);

								chai.request(baseUrl)
								.get('/rules/')
								.set(token_header_flag, token)
								.end((err,res) => {

									res.should.have.status(200);
									res.body.rules.length.should.be.eql(1);
									
									console.log('Logging Rules Array:');
									console.log(res.body.rules);
									
									var rulesToEngine = [];
									res.body.rules.forEach(function(rule){
										var ruleToEngine = {
											name: rule.blob.name,
											condition: rule.blob.condition,
											consequence: rule.blob.consequence,
											priority: rule.blob.priority
										};
										rulesToEngine.push(ruleToEngine);
									});

									var fact = { // coincide con el fact de rulesEngine.js
										"type": "pasajero",
									    "saldo": 15,
									    "email": "florencia@gmail.com",
									    "kmRecorridos": 2,
									    "costoTotal": 0,
									    "dia": "miercoles",
									    "hora": "15:20:58",
									    "viajesHoy": 5,
									    "primerViaje": true,
									};

									// Corre las exampleRules
									// R.runExampleEngine(R.exampleRules, fact); // Corre OK

									// Corre la RuleNombrePrueba definida arriba
									R.runEngine(rulesToEngine, fact); // reason: Probando prueba string OK

									done();
								});
							});
						});
					});				
				});
			});
	    });
	});

	describe('/PUT rules', function() {
	 	it('it should PUT an existing rule', function(done) {
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
						var token = res.body.token.token;

						chai.request(baseUrl)
						.get('/rules/dropRuleTable')
						.set(token_header_flag, token)
						.end((err, res) => {
							var blob = {
								name: 'RuleNombrePrueba',
			                    condition: "function(R) { R.when(this.type == 'pasajero'); }",
			                    consequence: "function(R) { this.puedeViajar = true; this.reason = 'Probando prueba string'; R.stop(); }",
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
							.set(token_header_flag, token)
							.send(rule)
							.end((err, res) => {
								res.should.have.status(201);
								var newBlob = {
									name: 'RuleNombrePruebaModificado',
				                    condition: "function(R) { R.when(this.type == 'pasajero'); }",
				                    consequence: "function(R) { this.puedeViajar = true; this.reason = 'Probando prueba string'; R.stop(); }",
				                    priority: 2
				                };
								var newRule = {
									_ref: 'abc', 
									language: 'node-rules/javascript', 
									blob: newBlob,
									active: false
								}
								chai.request(baseUrl)
								.put('/rules/' + blob.name)
								.send(newRule)
								.set(token_header_flag, token)
								.end((err,res) => {
									res.should.have.status(200);
									res.body.rule.active.should.equal(newRule.active);
									res.body.rule.blob.name.should.equal(newBlob.name);

									done();
								});
							});
						});
					});				
				});
			});
	    });
	});
	
	describe('/DELETE rules', function() {
	   	it('it should DELETE a rule', function(done) {
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
						var token = res.body.token.token;

						chai.request(baseUrl)
						.get('/rules/dropRuleTable')
						.set(token_header_flag, token)
						.end((err, res) => {
							var blob = {
									name: 'RuleNombrePrueba',
				                    condition: "function(R) { R.when(this.type == 'pasajero'); }",
				                    consequence: "function(R) { this.puedeViajar = true; this.reason = 'Probando delete rule'; R.stop(); }",
				                    priority: 2};
							var rule = {
								_ref: 'abc', 
								language: 'node-rules/javascript', 
								blob: blob,
								active: true
							}
							chai.request(baseUrl)
							.post('/rules')
							.set(token_header_flag, token)
							.send(rule)
							.end((err, res) => {
								res.should.have.status(201);

								chai.request(baseUrl)
								.delete('/rules/' + blob.name)
								.set(token_header_flag, token)
								.end((err,res) => {
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
});
