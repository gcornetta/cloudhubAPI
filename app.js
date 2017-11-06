
/**
 * Module dependencies
 */
require('dotenv').config();

var express = require('express'),
  bodyParser = require('body-parser'),
  methodOverride = require('method-override'),
  errorHandler = require('express-error-handler'),
  morgan = require('morgan'),
  http = require('http'),
  path = require('path'),
  MongoClient = require('mongodb').MongoClient,
  assert = require('assert'),

  //ROUTES
  routes = require('./routes'),
  api = require('./routes/api'),
  registerFabLab = require('./routes/registerFabLab').registerFabLab;
  registerService = require('./routes/registerService').registerService;
  submitJob = require('./routes/submitJob').submitJob;

var app = module.exports = express();

var globalDB;

// Connection URL
var url = process.env.MONGO_URL;
// Use connect method to connect to the server
MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
  globalDB = db;
});

/**
 * Configuration
 */
app.use(function (req, res, next) {
   req.db = globalDB;
   next();
});

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(morgan('dev'));
app.use(bodyParser());
app.use(methodOverride());
app.use(express.static(path.join(__dirname, 'public')));

var env = process.env.NODE_ENV || 'development';

// development only
if (env === 'development') {
  app.use(errorHandler());
}

// production only
if (env === 'production') {
  // TODO
}


/**
 * Routes
 */

// serve index and view partials
app.get('/', routes.index);
app.get('/partials/:name', routes.partials);
// JSON API
app.get('/api/name', api.name);
app.post('/api/registerFabLab', registerFabLab);
app.post('/api/registerService', registerService);
app.post('/api/submitJob', submitJob);

// redirect all others to the index (HTML5 history)
app.get('*', routes.index);


/**
 * Start Server
 */

http.createServer(app).listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});
