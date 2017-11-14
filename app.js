
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
  postFabLab = require('./routes/postFabLab').postFabLab;
  connectFabLab = require('./routes/connectFabLab').connectFabLab;
  postService = require('./routes/postService').postService;
  postJob = require('./routes/postJob').postJob;
  deleteJob = require('./routes/deleteJob').deleteJob;
  getFabLabs = require('./routes/getFabLabs').getFabLabs;

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
   res.header('Access-Control-Allow-Origin', '*');
   res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
   res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
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
app.post('/fablabs', postFabLab);
app.post('/fablabs/connect', connectFabLab);
app.post('/fablabs/services', postService);
app.post('/fablabs/jobs', postJob);
app.get('/fablabs', getFabLabs);
app.get('/fablabs/:fablabId', getFabLabs);
app.delete('/fablabs/:fablabId', deleteJob);

// redirect all others to the index (HTML5 history)
app.get('*', routes.index);


/**
 * Start Server
 */

http.createServer(app).listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});
