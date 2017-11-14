var request = require('request');
var multiparty = require('multiparty');
var fs = require('fs');

function postJob (req, res) {
	var job = req.query;
	if (checkFields(job)){
	var form = new multiparty.Form();
    form.parse(req, function(err, fields, files) {
      if (files && files.file){
        job.file = files.file[0].path;
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
                        if (doc){
                            //TODO: Send job to pigateway and wait response
                            sendJob(req.db, job, doc, function (err, result){
                                if (err){
                                    res.status(500);
                                    res.json(err);
                                }else{
                                    res.json(doc);
                                }
                            })
                        }else{
                            res.status(400);
                            res.json({'err': 'No fablabs available'})
                        }
                    }
                });
    	    }
    	})
      }else{
        res.status(400);
        res.json({'err': 'Missing attachment'});
      }
    });
    }else{
        res.status(400);
        res.json({'err': 'Incomplete job info'});
    }
}

function checkConsulServers(service, tag, callback){
    var serversCritical = [];
    var resultArray = [];
    if (!tag){
        tag = ""
    }else{
        tag = "?tag="+tag.toLowerCase()
    }
    request.post(process.env.CONSUL_ADDR +'/v1/catalog/service/'+service.toLowerCase()+tag, function(err, res, body) {
        if (err){
            callback (err, resultArray);
        }else{
            if (!body){
                body = '{}';
            }
            var services = JSON.parse(body);
            request.post(process.env.CONSUL_ADDR +'/v1/health/state/critical', function(err, res, body) {
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
    db.collection('fablabs').findOne({
        "_id": {$in: serversUp},
        "equipment": { $elemMatch :{type: job.machine, status: {$nin: ["busy"]}}},
    	"location":
            { $near :
                {
                    $geometry: { type: "Point",  coordinates: [ parseFloat(job.long), parseFloat(job.lat) ] }
                }
            }
    }, callback);
}

function sendJob(db, job, fablab, callback){
    /*var formData = {file: fs.createReadStream(job.file)};
    delete job.file;
    var req = request.post({url: 'http://'+fablab.api +':'+ fablab.port +'/fablabs/jobs', qs: job, formData: formData}, function(err, res, body) {
            if (err){
                callback (err);
            }else{*/
                //TODO: Pigateway must return jobID and machineID
                //TEST
                if (!job.machineId){
                    job.machineId = 'exampleMachine',
                    job.id = Math.round(Math.random()*100000)+"a";
                }

                db.collection('fablabs').updateOne(
                    {"_id": fablab._id, "jobs.details.machineId": job.machineId},
                 	{ $push: { "jobs.details.$.jobs": job }, $inc : {"jobs.queued": 1} }
                , callback);
            /*}
        });*/
}

function checkFields (job){
    if (
        job
        && "machine" in job
        && "process" in job
        && "material" in job
        && "lat" in job
        && "long" in job
    ){
        return true;
    }else{
        return false;
    }
}

exports.postJob = postJob;