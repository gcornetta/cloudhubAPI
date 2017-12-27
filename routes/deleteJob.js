var request = require('request');

function deleteJob (req, res) {
	var jobId = req.query.job;
	var fablabId = req.params.fablabId;

    if (jobId && fablabId){
	    req.db.collection('fablabs').findOne({"_id": require('mongodb').ObjectID(fablabId)}, function (err, doc){
	        if (err){
    	        res.status(500);
	            res.json(err);
	        }else{
    	        if (doc){
	                cancelJob(req.db, jobId, doc, function (err, result){
	                    if (err){
	                        res.status(400);
                            res.json(err);
	                    }else{
                	        res.json(result);
                	    }
                    });
                }else{
                    res.status(400);
                    res.json({'err': 'Job not found'});
                }
	        }
	    });
	}else{
	    res.status(400);
        res.json({'err': 'Incomplete params'});
	}
}

//TODO: check returned body
function cancelJob(db, jobId, fablab, callback){
    var req = request.delete({url:'http://'+fablab.api +':'+ fablab.port +'/fablab/jobs/'+jobId}, function(err, res, body) {
        if (err){
            callback (err);
        }else if (!JSON.parse(body).code){
            db.collection('jobs').removeOne({"id": jobId}, function (err, doc){
                if (err){
                    callback(err);
                }else{
                    db.collection('fablabs').updateOne(
                        {"_id": require('mongodb').ObjectID(fablab._id),
                        "jobs.details": {$elemMatch: {"jobs": {$elemMatch: {"id": jobId}}}}},
                        { $pull: { "jobs.details.$.jobs": {"id": jobId} }, $inc : {"jobs.queued": -1}}
                    , callback);
                }
            });
        }else{
            switch (JSON.parse(body).code){
                default:
                    callback(JSON.parse(body));
                break;
            }
        }
    });
}

exports.deleteJob = deleteJob;