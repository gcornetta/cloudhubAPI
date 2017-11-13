var request = require('request');

function deleteJob (req, res) {
	var jobId = req.query.job;
	var fablabId = req.params.fablabId;

	console.log(req.query)
	console.log(req.params)

    if (jobId && fablabId){
	    req.db.collection('fablabs').findOne({"_id": require('mongodb').ObjectID(fablabId)}, function (err, doc){
	        if (err){
    	        res.status(500);
	            res.json(err);
	        }else{
    	        if (doc){
	                cancelJob(req.db, jobId, doc, function (err, result){
                        console.log(err)
                	    console.log(result)
                	    res.json(result);
                    })
                }else{
                    res.status(400);
                    res.json({'err': 'Fablab not found'});
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
    /*var req = request.delete({url:'http://'+fablab.api +':'+ fablab.port +'/fablabs/'+fablab._id, qs: {job: jobId}}, function(err, res, body) {
        if (err){
            callback (err);
        }else{*/
            db.collection('fablabs').updateOne(
                {"_id": require('mongodb').ObjectID(fablab._id),
                "jobs.details": {$elemMatch: {"jobs": {$elemMatch: {"id": jobId}}}}},
            	{ $pull: { "jobs.details.$.jobs": {"id": jobId} }, $inc : {"jobs.queued": -1}}
            , callback);
        /*}
    });*/
}

exports.deleteJob = deleteJob;