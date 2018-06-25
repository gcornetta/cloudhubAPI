
/**
 * Module dependencies
 */
require('dotenv').config()

var express = require('express')
var bodyParser = require('body-parser')
var methodOverride = require('method-override')
var errorHandler = require('express-error-handler')
var http = require('http')
var path = require('path')
var mongoUtil = require('./resources/db')
var refreshJobs
var wsServer  // eslint-disable-line

// ROUTES
// var postFabLab = require('./routes/postFabLab').postFabLab
var connectFabLab = require('./routes/connectFabLab').connectFabLab
// var postService = require('./routes/postService').postService
var postJob = require('./routes/postJob').postJob
var getJob = require('./routes/getJob').getJob
var deleteJob = require('./routes/deleteJob').deleteJob
var getFabLabs = require('./routes/getFabLabs').getFabLabs
var getJobsQuery = require('./routes/getJobsQuery').getJobsQuery

var app = module.exports = express()
var globalDB

mongoUtil.connectToServer(function (err, db) {
  if (!err) {
    globalDB = db
    wsServer = require('./resources/wsServer')
    refreshJobs = require('./resources/refreshJobs')
    refreshJobs.refreshJobs()
  } else {
    console.error('\x1b[31m', err)
  }
})

/**
 * Configuration
 */
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Authentication, newtonUser')
  req.db = globalDB
  req.refreshJobs = refreshJobs
  next()
})

// all environments
app.set('port', process.env.PORT || 3000)
app.use(bodyParser())
app.use(methodOverride())
app.use(express.static(path.join(__dirname, 'public')))

var env = process.env.NODE_ENV || 'development'

// development only
if (env === 'development') {
  app.use(errorHandler())
}

// production only
if (env === 'production') {
  // TODO
}

/**
 * Routes
 */
app.get('/', function (req, res) { res.json({}) })
// app.post('/fablabs', postFabLab);
app.post('/fablabs/connect', connectFabLab)
// app.post('/fablabs/services', postService);
app.post('/fablabs/jobs', postJob)
app.get('/fablabs/jobs', getJob)
app.get('/fablabs', getFabLabs)
app.get('/fablabs/:fablabId', getFabLabs)
app.get('/fablabs/:fablabId/jobs', getJobsQuery)
app.delete('/fablabs/:fablabId', deleteJob)
app.delete('/fablabs/:fablabId/jobs', deleteJob)

/**
 * Start Server
 */

http.createServer(app).listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'))
})
