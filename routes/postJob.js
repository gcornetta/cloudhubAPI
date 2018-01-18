var request = require('request');
var multiparty = require('multiparty');
var fs = require('fs');
var checkToken = require('../helpers/permissions');
var getUserId = checkToken.getUserId;

function postJob (req, res) {
    var token = req.get("Authentication");
    checkToken.checkToken(token, function(authorized, payload){
        if (authorized && payload){
            var job = req.query;
            if (checkFields(job)){
            var form = new multiparty.Form();
            form.parse(req, function(err, fields, files) {
              if (files && files.file){
                job.file = files.file[0].path;
                var format;
                if (job.machine === "3D printer"){
                    format = ".gcode";
                }else{
                    format = ".png";
                }
                if (!job.file.endsWith(format)) {
                    res.status(400);
                    res.json({'err': 'Unsupported file format'})
                } else {
                  checkConsulServers(job.machine, job.material, function (err, availableServers){
                    if (err){
                        res.status(500);
                        res.json(err);
                    }else{
                        getNearestFabLab(req.db, job, availableServers, function(err, doc) {
                            if (err){
                                res.status(500);
                                res.json(err);
                            }else{
                                if (doc[0]){
                                    if (req.get("Authentication")){
                                        job.userId = req.get("newtonUser") || getUserId(req.get("Authentication"));
                                        delete job.newtonUser;
                                        job.userCloudhub = getUserId(req.get("Authentication"));
                                        job.fablabId = doc[0]._id;
                                        sendJob(req.db, job, doc, 0, function (err, result){
                                            if (err){
                                                res.status(500);
                                                res.json(err);
                                            }else{
                                                res.json(job);
                                            }
                                        })
                                    }else{
                                        res.status(403);
                                        res.json({'err': 'Unauthorized'});
                                    }
                                }else{
                                    res.status(400);
                                    res.json({'err': 'No fablabs available'})
                                }
                            }
                        });
                    }
                  })
                }
              }else{
                res.status(400);
                res.json({'err': 'Missing attachment'});
              }
            });
            }else{
                res.status(400);
                res.json({'err': 'Incomplete job info'});
            }
        }else{
            res.status(403);
            res.json({'err': 'Unauthorized'});
        }
    });
}

console.log(process.env.CONSUL_ADDR);
request.get(process.env.CONSUL_ADDR+'/v1/health/state/critical', function(err, res, body) {
        if (err){
            console.log(err);
        }else{
            console.log(res)
            console.log(body)
        }
    });

function checkConsulServers(service, tag, callback){
    var serversCritical = [];
    var resultArray = [];
    if (!tag){
        tag = ""
    }else{
        tag = "?tag="+tag.toLowerCase()
    }
    console.log(process.env.CONSUL_ADDR +'/v1/catalog/service/'+service.toLowerCase()+tag)
    request.get(process.env.CONSUL_ADDR +'/v1/catalog/service/'+service.toLowerCase()+tag, function(err, res, body) {
        if (err){
            console.log(err);
            callback (err, resultArray);
        }else{
            if (!body){
                body = '{}';
            }
            var services = JSON.parse(body);
            request.get(process.env.CONSUL_ADDR +'/v1/health/state/critical', function(err, res, body) {
                if (!body){
                    body = '{}';
                }
                var critical = JSON.parse(body);
                for (var i in critical){
                    if(critical[i].ServiceID){
    	                serversCritical.push(critical[i].ServiceID);
        	        }
                }
    	        for (var i in services){
        	        if((services[i].ServiceID)&&(serversCritical.indexOf(services[i].ServiceID) === -1)){
        	            services[i].ServiceID = require('mongodb').ObjectID(services[i].ServiceID.slice(0, services[i].ServiceID.indexOf("_")));
    	                resultArray.push(services[i].ServiceID);
        	        }
    	        }
                callback (err, resultArray);
            });
        }
    });
}

function getNearestFabLab(db, job, serversUp, callback){
    db.collection('fablabs').find({
        "_id": {$in: serversUp},
        "equipment": { $elemMatch :{type: job.machine, status: {$nin: ["busy"]}}},
    	"location":
            { $near :
                {
                    $geometry: { type: "Point",  coordinates: [ parseFloat(job.long), parseFloat(job.lat) ] }
                }
            }
    }).toArray(callback);
}

function sendJob(db, job, fablabs, fablabIndex, callback){
    var fablab = fablabs[fablabIndex];
    var formData = {file: fs.createReadStream(job.file)};
    var queryString = JSON.parse(JSON.stringify(job));
    queryString.user = queryString.userId;
    delete queryString.userId;
    delete queryString.file;
    delete queryString.lat;
    delete queryString.long;
    var req = request.post({url: 'http://'+fablab.api +':'+ fablab.port +'/fablab/jobs', qs: queryString, formData: formData}, function(err, res, body) {
            if (err){
                callback (err);
            }else if (!JSON.parse(body).code){
                job.id = JSON.parse(body).jobId;
                job.machineId = JSON.parse(body).mId;
                job.fablabId = fablab._id;
                job.status = "pending";
                db.collection('jobs').insert(job, function(err, doc){
                    if (err){
                        callback(err);
                    }else{
                        db.collection('fablabs').updateOne(
                            {"_id": fablab._id, "jobs.details.machineId": job.machineId},
                            { $push: { "jobs.details.$.jobs": job }, $inc : {"jobs.queued": 1} },
                            callback);
                    }
                });
            }else{
                switch (JSON.parse(body).code){
                    case 7: //Fablab busy. Try next fablab
                        if (fablabs[fablabIndex+1]){
                            sendJob(db, job, fablabs, fablabIndex+1, callback);
                        }else{
                            callback({'err': 'No fablabs available'})
                        }
                    break;
                    case 3: //Fablab object not built yet. Try again after 1 second
                        setTimeout(function(){
                            sendJob(db, job, fablabs, fablabIndex, callback);
                        }, 1000);
                    break;
                    default:
                        callback(JSON.parse(body));
                    break;
                }
            }
        });
}

function checkFields (job){
    if (
        job
        && "machine" in job
        && "lat" in job
        && "long" in job
    ){
        return true;
    }else{
        return false;
    }
}

exports.postJob = postJob;