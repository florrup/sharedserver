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
 *  Test methods for payments endpoint API
 */
describe('Paymethods', function()  {
	var paymethodsAPI = require('../routes/paymethods');
	
	describe('/GET Paymethods', function() {
		
		it('it should have no permission to access paymethods without token', function(done) {
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
	
	it('it should get payment methods from remote API', function(done) {
			this.timeout(15000);
			
			chai.request(baseUrl)
			.get('/servers/initAndWriteDummyServer/')
			.end((err,res) => {
				var token = res.body.serverToken;
				
				chai.request(baseUrl)
				.get('/paymethods/')
				.set(token_header_flag, token)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.have.property('metadata');
					done();
					// res.body.should.have.property('paymethods');
					// console.log() ...
				});
			});
	});

});