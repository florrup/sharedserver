# Shared Server

[![Build Status](https://travis-ci.org/florrup/sharedserver.svg?branch=master)](https://travis-ci.org/florrup/sharedserver) [![Coverage Status](https://coveralls.io/repos/github/florrup/sharedserver/badge.svg?branch=master)](https://coveralls.io/github/florrup/sharedserver?branch=master)

-----------------------------------------------------------
## Running Locally

Make sure you have [Node.js](http://nodejs.org/) and the [Heroku CLI](https://cli.heroku.com/) installed.

```sh
$ git clone https://github.com/florrup/sharedserver.git
$ cd sharedserver
$ npm install
$ npm start
```

Your app should now be running on [localhost:5000](http://localhost:5000/).

-----------------------------------------------------------
## Deploying to Heroku

```
$ heroku create
$ git push heroku master
$ heroku open
```
or

[![Deploy to Heroku](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy)

-----------------------------------------------------------
## Docker

```
$ sudo docker build -t fiuba/sharedserver .
$ sudo docker run -p 5000:5000 -d fiuba/sharedserver
$ curl -i localhost:5000/
```

-----------------------------------------------------------
## Generating Doxygen Documentation (deprecated, see jdocs below)

```
$ apt-get install doxygen
$ doxygen
```

-----------------------------------------------------------
## Running Database commands

Read: https://devcenter.heroku.com/articles/heroku-postgresql#local-setup
Login to heroku from terminal
Set remote heroku
get database connection
```
$heroku login
$heroku git:remote -a serene-peak-94842
$heroku pg:psql

To restore database tables
(in database terminal from prevoius step)
PSQL> ...run CREATE commands commented in each route file to create psql database tables
```
-----------------------------------------------------------
#Building Database from scratch
See file setup.sql and run those commands to create the tables into the database (see above, running commands into database)

!IMPORTANT: remember to create the default pricing rules to start a fresh server database. Hit the method 
GET <app_host>/apiX/rules/setDefaultRules from the API to get a fresh default rules set

To modify the default rules modify the file ./routes/defaultPricingRules.js from the main app directory
(keep an original copy safe from this file or get it again from the repo if you brake it)

-----------------------------------------------------------
# Running built-in tests

$npm test

-----------------------------------------------------------
# Building and Watching the React app
See the scripts in the main "package.json" application file, the scripts watch and build. They can be run as:

$npm run watch
(starts watching the React files and rebuilds online, in the browser you have to refresh to see the changes)

$npm run build
(builds the React application once)

-----------------------------------------------------------
# Generating HTML DOC with jsdoc
Install globally jsdoc with npm:
$npm install -g jsdoc

Then generate doc for index.js main app file and ./models and ./routes directories
$jsdoc index.js models routes

The output of new HTML doc will be the directory ./out inside the main application directory
-----------------------------------------------------------