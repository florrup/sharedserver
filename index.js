var express = require('express');
var app = express();

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('pages/index');
});

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
    client.query('SELECT * FROM test_table', function(err, result) {

      console.log('Getting data from test_table');

      done();
      if (err)
       { console.error(err); response.send("Error " + err); }
      else
       { response.render('pages/db', {results: result.rows} ); }
    });

  });	

});

// testing coveralls

function getStringToPrint() {
  return "Hello World!";
}
 
console.log(getStringToPrint());
 
module.exports = { getStringToPrint: getStringToPrint };