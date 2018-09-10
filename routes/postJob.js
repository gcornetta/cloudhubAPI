var request = require('request')
var multiparty = require('multiparty')
var fs = require('fs')
var checkToken = require('../helpers/permissions')
var getUserId = checkToken.getUserId

function postJob (req, res) {
  var token = req.get('Authentication')
  checkToken.checkToken(token, function (authorized, payload) {
    if (authorized && payload) {
      var job = req.query
      if (checkFields(job)) {
        var form = new multiparty.Form()
        form.parse(req, function (err, fields, files) {
          if (!err && files && files.file) {
            job.file = files.file[0].path
            if ((files.auxFile) && (files.auxFile[0])) {
              job.auxFile = files.auxFile[0].path
            }
            var format
            if (job.machine === '3D printer') {
              format = '.gcode'
            } else {
              format = '.png'
            }
            if (!job.file.endsWith(format)) {
              res.status(400)
              res.json({'err': 'Unsupported file format'})
            } else {
              /* checkConsulServers(job.machine, job.material, function (err, availableServers){
               if (err){
               res.status(500);
               res.json(err);
               }else{
               getNearestFabLab(req.db, job, availableServers, function(err, doc) { */
              getNearestFabLab(req.db, job, [], function (err, doc) {
                if (err) {
                  res.status(500)
                  res.json(err)
                } else {
                  if (doc[0]) {
                    if (req.get('Authentication')) {
                      job.userId = req.get('newtonUser') || getUserId(req.get('Authentication'))
                      job.username = payload.email
                      delete job.newtonUser
                      job.userCloudhub = getUserId(req.get('Authentication'))
                      job.fablabId = doc[0]._id
                      sendJob(req.db, job, doc, 0, function (err, result) {
                        if (err) {
                          res.status(500)
                          res.json(err)
                        } else {
                          res.json(job)
                        }
                      })
                    } else {
                      res.status(403)
                      res.json({'err': 'Unauthorized'})
                    }
                  } else {
                    res.status(400)
                    res.json({'err': 'No fablabs available'})
                  }
                }
              })
              /* }
               }) */
            }
          } else {
            console.log(err)
            console.log(files)
            res.status(400)
            res.json({'err': 'Missing attachment'})
          }
        })
      } else {
        res.status(400)
        res.json({'err': 'Incomplete job info'})
      }
    } else {
      res.status(403)
      res.json({'err': 'Unauthorized'})
    }
  })
}

/* function checkConsulServers (service, tag, callback) {
  var serversCritical = []
  var resultArray = []
  if (!tag) {
    tag = ''
  } else {
    tag = '?tag=' + tag.toLowerCase()
  }
  var url = process.env.CONSUL_ADDR + '/v1/catalog/service/' + service.toLowerCase() + tag
  url = url.replace(' ', '%20')
  request.get(url, function (err, res, body) {
    url = process.env.CONSUL_ADDR + '/v1/catalog/service/' + service.toLowerCase() + tag
    if (err) {
      console.log(err)
      callback(err, resultArray)
    } else {
      var services = {}
      try {
        services = JSON.parse(body)
      } catch (e) {
        console.log(e)
        console.log(body)
        callback(body, resultArray)
        callback = null
      }
      if (callback) {
        request.get(process.env.CONSUL_ADDR + '/v1/health/state/critical', function (err, res, body) {
          var critical = {}
          try {
            critical = JSON.parse(body)
          } catch (e) {
            console.log(e)
            // console.log(body);
          }
          for (var i in critical) {
            if (critical[i].ServiceID) {
              serversCritical.push(critical[i].ServiceID)
            }
          }
          for (var j in services) {
            if ((services[j].ServiceID) && (serversCritical.indexOf(services[j].ServiceID) === -1)) {
              services[j].ServiceID = require('mongodb').ObjectID(services[j].ServiceID.slice(0, services[j].ServiceID.indexOf('_')))
              resultArray.push(services[j].ServiceID)
            }
          }
          callback(err, resultArray)
        })
      }
    }
  })
} */

function getNearestFabLab (db, job, serversUp, callback) {
  db.collection('fablabs').find({
    // "_id": {$in: serversUp},
    'equipment': {$elemMatch: {type: job.machine, status: {$nin: ['busy']}}},
    'location':
    { $near:
    {
      $geometry: { type: 'Point', coordinates: [ parseFloat(job.long), parseFloat(job.lat) ] }
    }
    }
  }).toArray(callback)
}

function sendJob (db, job, fablabs, fablabIndex, callback) {
  var fablab = fablabs[fablabIndex]
  var formData = {file: fs.createReadStream(job.file)}
  if (job.auxFile) {
    formData.auxFile = fs.createReadStream(job.auxFile)
  }
  var queryString = JSON.parse(JSON.stringify(job))
  queryString.user = queryString.userId
  delete queryString.userId
  delete queryString.file
  delete queryString.lat
  delete queryString.long
  request.post({url: 'http://' + fablab.api + ':' + fablab.port + '/fablab/jobs', qs: queryString, formData: formData}, function (err, res, body) {
    if (err) {
      if (fablabs[fablabIndex + 1]) {
        sendJob(db, job, fablabs, fablabIndex + 1, callback)
      } else {
        callback(err)
      }
    } else {
      try {
        var parsedResponse = JSON.parse(body)
      } catch (e) {
        console.log(e)
        console.log(body)
      }
      if (parsedResponse) {
        if (!parsedResponse.code) {
          job.id = parsedResponse.jobId
          job.machineId = parsedResponse.mId
          job.fablabId = fablab._id
          job.status = 'pending'
          db.collection('jobs').insert(job, function (err, doc) {
            if (err) {
              callback(err)
            } else {
              fs.unlink(job.file, function (err) { if (err) { console.log(err) } })
              if (job.auxFile) {
                fs.unlink(job.auxFile, function (err) { if (err) { console.log(err) } })
              }
              db.collection('fablabs').updateOne(
                  {'_id': fablab._id, 'jobs.details.machineId': job.machineId},
                  { $push: { 'jobs.details.$.jobs': job }, $inc: {'jobs.queued': 1} },
                  callback)
            }
          })
        } else {
          switch (parsedResponse.code) {
            case 7: // Fablab busy. Try next fablab
              if (fablabs[fablabIndex + 1]) {
                sendJob(db, job, fablabs, fablabIndex + 1, callback)
              } else {
                callback({'err': 'No fablabs available'}) // eslint-disable-line
              }
              break
            case 3: // Fablab object not built yet. Try again after 1 second
              setTimeout(function () {
                sendJob(db, job, fablabs, fablabIndex, callback)
              }, 1000)
              break
            default:
              if (fablabs[fablabIndex + 1]) {
                sendJob(db, job, fablabs, fablabIndex + 1, callback)
              } else {
                callback(parsedResponse)
              }
              break
          }
        }
      } else {
        if (fablabs[fablabIndex + 1]) {
          sendJob(db, job, fablabs, fablabIndex + 1, callback)
        } else {
          callback(body)
        }
      }
    }
  })
}

function checkFields (job) {
  if (
      job &&
      'machine' in job &&
      'lat' in job &&
      'long' in job
  ) {
    return true
  } else {
    return false
  }
}

exports.postJob = postJob
