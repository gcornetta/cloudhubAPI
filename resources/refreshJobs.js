var request = require('request');
const mongoUtil = require('./db');
var updating = {};

var db = mongoUtil.getDB();

function refreshJobs(){
    console.log("llamado refreshjobs")
    db.collection('fablabs').find({}).toArray(function(err, fablabs) {
        if (err){
            console.log(err);
        }else{
            for (var f in fablabs){
                console.log(fablabs[f]._id);
                getAndUpdateFablabJobs(fablabs[f]);
            }
        }
    });
}

function updateJobStatus(jobId, status, callback){
    db.collection('jobs').updateOne({id: jobId}, {$set:{"status": status}}, callback);
}

function deleteJob(jobId, callback){
    db.collection('jobs').removeOne({"id": jobId}, function (err, doc){
        if (err){
            callback(err);
        }else{
            db.collection('fablabs').updateOne(
                {"_id": require('mongodb').ObjectID(doc.fablabId),
                "jobs.details": {$elemMatch: {"jobs": {$elemMatch: {"id": jobId}}}}},
                { $pull: { "jobs.details.$.jobs": {"id": jobId} }, $inc : {"jobs.queued": -1}}
            , callback);
        }
    });
}

function getAndUpdateFablabJobs(fablab){
    if ((fablab.api)&&(fablab.port)){
        if (updating[fablab._id]){
            clearInterval(updating[fablab._id]);
        }
        var interval = setInterval(function(){
            var req = request.get({url: 'http://'+fablab.api+ ":" + fablab.port + '/fablab/'}, function(err, res, body) {
                if (err){
                    console.log (err);
                }else{
                    try {
                        var fablabWrapper = JSON.parse(body);
                    } catch (e) {
                        console.log(e);
                        console.log(body);
                    }
                    if (fablabWrapper){
                        var jobs = fablabWrapper.jobs.details;
                        for (var fab in jobs){
                            for (var j in jobs[fab].jobs){
                                //console.log(jobs[fab].jobs[j]);
                                updateJobStatus(jobs[fab].jobs[j].id, jobs[fab].jobs[j].status, function (err, res){
            console.log("refresh----------------------------------------")
            console.log(fablab._id)
            console.log(fablab.api)
            console.log(fablab.port)
            console.log(res.result.nModified)
                                    if (res.result.nModified === 0){
                                        getAndInsertJob(fablab, jobs[fab].jobs[j].id);
                                    }
                                });
                            }
                        }
                    }
                }
            });
        }, 30000);
        updating[fablab._id] = interval;
    }
}

function getAndInsertJob(fablab, jobId){
    var req = request.get({url: 'http://'+fablab.api+ ":" + fablab.port + '/fablab/jobs/status/'+jobId}, function(err, res, body) {
                if (err){
                    console.log (err);
                }else{
                    try {
                        var job = JSON.parse(body);
                    } catch (e) {
                        console.log(e);
                        console.log(body);
                    }
                    if (job){
                        console.log(job);
                        db.collection('jobs').insert(job, function(err, res){
                            console.log("insertJOb---------------")
                            if (err) {console.log("error")}else{console.log("bien")}
                        });
                    }
                }
    });
}

exports.refreshJobs = refreshJobs;
exports.getAndUpdateFablabJobs = getAndUpdateFablabJobs;