//! @file index.js
//! Starts the app

var express = require('express');
var bodyParser = require('body-parser');

var app = express();
app.use(express.static(__dirname + '/public'));

// winston logger
var logger = require('./utils/logger');

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('pages/index');
  //response.send('Hello World');
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// routes
app.use('/api', require('./routes/api'));

// starts server
app.set('port', (process.env.PORT || 5000));

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

// connects to the database
var pg = require('pg');
pg.defaults.ssl = true;

app.get('/db', function (request, response) {

  console.log('Get /db');
  console.log(process.env.DATABASE_URL);

  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    console.log('Connecting to db...');
    client.query('SELECT * FROM users', function(err, result) {

      console.log('Getting data from users');
      logger.info('Getting data from users');

      done();
      if (err)
       { console.error(err); response.send("Error " + err); }
      else
       { response.render('pages/db', {results: result.rows} ); }
    });

  });	

});


/**
 * Returns "Hello World!" in order to test Coveralls
 *
 * @return {string}
 */
 function getStringToPrint() {
  return "Hello World!";
}
 
console.log(getStringToPrint());
 
module.exports = { getStringToPrint: getStringToPrint };