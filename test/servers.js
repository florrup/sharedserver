//! @package test
//! @file servers.js

process.env.DATABASE_URL = 'postgres://nvvgpxztxxdugy:794bac95662fe3643cd76663cac5d8aab38e124878b513e5a796068e9ebbe281@ec2-23-23-234-118.compute-1.amazonaws.com:5432/de2pgllaiv55c3';

var chai = require('chai');
var chaiHttp = require('chai-http');
var baseUrl = 'http://localhost:5000/api';
var api = require('../routes/api');
var should = chai.should();
var util = require('util');

var serversAPI = require('../routes/servers');

chai.use(chaiHttp);

describe('Servers', function()  {

	describe('/GET servers', function() {
	  	it('it should GET servers', function(done) {
		    this.timeout(15000);

		    chai.request(baseUrl)
		        .get('/servers/')
		        .end((err, res) => {
			        res.should.have.status(200);
			        res.body.should.be.a('array');
			        //res.body.length.should.be.eql(0);
			        done();
		        });
	    });
	  });

	describe('/POST server', function() {
	  	it('it should POST a server', function(done) {
	  		var newServer = {
		    	id: 1,
		        createdBy: 'testCreator',
		        name: 'testName'
		    };
		    this.timeout(15000);

	        chai.request(baseUrl)
	            .post('/servers/')
	            .send(newServer)
	            .end((err, res) => {
	                res.should.have.status(201);
	                res.body.length.should.be.eql(1);
	              done();
	            });
	    });
	 });

	describe('/DELETE server', function() {
	  	it('it should DELETE a server', function(done) {
	  		var serverToDelete = {
		    	id: 2,
		        createdBy: 'testCreator',
		        name: 'testName'
		    };
		    this.timeout(15000);

	        chai.request(baseUrl)
	            .post('/servers/')
	            .send(serverToDelete)
	            .end((err, res) => {
	                res.should.have.status(201);
	                res.body.length.should.be.eql(1);
	            });
	        chai.request(baseUrl)
	            .delete('/servers/2')
	            .send(serverToDelete)
	            .end((err, res) => {
	                res.should.have.status(204);
	              done();
	            });
	    });
	 });

	describe('/GET server', function() {
	  	it('it should GET a server', function(done) {
	  		var serverToGet = {
		    	id: 3,
		        createdBy: 'testCreator',
		        name: 'testName'
		    };
		    this.timeout(15000);

	        chai.request(baseUrl)
	            .post('/servers/')
	            .send(serverToGet)
	            .end((err, res) => {
	                res.should.have.status(201);
	                res.body.length.should.be.eql(1);
	            });
	        chai.request(baseUrl)
	            .get('/servers/3')
	            .send(serverToGet)
	            .end((err, res) => {
	                res.should.have.status(200);
	                //res.body.length.should.be.eql(1);
	              done();
	            });
	    });
	 });

});