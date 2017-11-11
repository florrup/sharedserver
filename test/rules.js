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
							console.log('HOLA');
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
							var rule = {
								_ref: 'abc', 
								language: 'node-rules/javascript', 
								blob: 'abc',
								active: true
							}

							chai.request(baseUrl)
							.post('/rules/')
							.set(token_header_flag, token)
							.send(rule)
							.end((err, res) => {
								res.should.have.status(201);
								res.body.should.have.property('metadata');
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
