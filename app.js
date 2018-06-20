
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
  mongoUtil = require('./resources/db'),
  refreshJobs,
  wsServer,

  //ROUTES
  postFabLab = require('./routes/postFabLab').postFabLab;
  connectFabLab = require('./routes/connectFabLab').connectFabLab;
  postService = require('./routes/postService').postService;
  postJob = require('./routes/postJob').postJob;
  getJob = require('./routes/getJob').getJob;
  deleteJob = require('./routes/deleteJob').deleteJob;
  getFabLabs = require('./routes/getFabLabs').getFabLabs;
  getJobsQuery = require('./routes/getJobsQuery').getJobsQuery;

var app = module.exports = express();
var globalDB;

mongoUtil.connectToServer(function(err, db){
    if (!err){
        globalDB = db;
        wsServer = require('./resources/wsServer');
        refreshJobs = require('./resources/refreshJobs');
        refreshJobs.refreshJobs();
    }else{
        console.error("\x1b[31m", err);
    }
})

/**
 * Configuration
 */
app.use(function (req, res, next) {
   res.header('Access-Control-Allow-Origin', '*');
   res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
   res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Authentication, newtonUser');
   req.db = globalDB;
   req.refreshJobs = refreshJobs;
   next();
});

// all environments
app.set('port', process.env.PORT || 3000);
//app.use(morgan('dev'));
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
app.get('/', function(req, res){res.json({})})
//app.post('/fablabs', postFabLab);
app.post('/fablabs/connect', connectFabLab);
//app.post('/fablabs/services', postService);
app.post('/fablabs/jobs', postJob);
app.get('/fablabs/jobs', getJob);
app.get('/fablabs', getFabLabs);
app.get('/fablabs/:fablabId', getFabLabs);
app.get('/fablabs/:fablabId/jobs', getJobsQuery);
app.delete('/fablabs/:fablabId', deleteJob);
app.delete('/fablabs/:fablabId/jobs', deleteJob);

/**
 * Start Server
 */

http.createServer(app).listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});
