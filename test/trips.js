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
 *  Test methods for trips management endpoints
 */
describe('Trips', function()  {

	var serversAPI = require('../routes/trips');

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
				var token = res.body.serverToken;
				
				var tripToEstimate = {
					passanger: 4,
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
				.set(token_header_flag, token)
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