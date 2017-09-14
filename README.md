# Shared Server

[![Build Status](https://travis-ci.org/florrup/sharedserver.svg?branch=master)](https://travis-ci.org/florrup/sharedserver) [![Coverage Status](https://coveralls.io/repos/github/florrup/sharedserver/badge.svg?branch=master)](https://coveralls.io/github/florrup/sharedserver?branch=master)

## Running Locally

Make sure you have [Node.js](http://nodejs.org/) and the [Heroku CLI](https://cli.heroku.com/) installed.

```sh
$ git clone https://github.com/florrup/sharedserver.git
$ cd sharedserver
$ npm install
$ npm start
```

Your app should now be running on [localhost:5000](http://localhost:5000/).

## Deploying to Heroku

```
$ heroku create
$ git push heroku master
$ heroku open
```
or

[![Deploy to Heroku](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy)

## Docker

```
$ sudo docker build -t fiuba/sharedserver .
$ sudo docker run -p 5000:5000 -d fiuba/sharedserver
$ curl -i localhost:5000/
```

## Generating Doxygen Documentation

```
$ apt-get install doxygen
$ doxygen
```
