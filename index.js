//! @file index.js
//! Starts the app

var express = require('express');
var bodyParser = require('body-parser');

var app = express();
app.use(express.static(__dirname + '/public'));

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

// --------------------------------------------------------------------------
// PG Database
// connects to the database
//var pg = require('pg');
//pg.defaults.ssl = true;

/*
app.get('/db', function (request, response) {

  const Pool = require('pg').Pool;

  const pool = new Pool({
    user: 'yvnmgtvwznipcx',
    host: 'ec2-184-73-249-56.compute-1.amazonaws.com',
    database: 'd2gv0cr5bou448',
    password: 'd2158d028efa41843d2788c28396c02b4bb47b9e2b0c207ad99f1c1dc266466e',
    port: 5432,
  } || process.env.DATABASE_URL);

  pool.connect((err, client, release) => {
    if (err) {
      return console.error('Error acquiring client', err.stack);
    }
    client.query('SELECT * FROM users', (err, result) => {
      release();
      if (err) {
        return console.error('Error executing query', err.stack);
      }
      response.render('pages/db', {results: result.rows} );
    });
  });

});
*/
// --------------------------------------------------------------------------

// --------------------------------------------------------------------------
// Sequelize Module: Instantiation and connection to Database 
var pg = require('pg');
const sequielize = require('./models/db');
// --------------------------------------------------------------------------

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