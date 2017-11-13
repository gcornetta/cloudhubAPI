var request = require('request');

function deleteJob (req, res) {
	var jobId = req.query.jobId;
	var fablabId = req.params.fablabId;

	cancelJob(req.db, jobId, fablabId, function (err, result){
	    console.log(err)
	    console.log(result)
	    res.json(result);
	})
}

//TODO: Send to pigateway
function cancelJob(db, jobId, fablabId, callback){

    db.collection('fablabs').updateOne(
        {"_id": require('mongodb').ObjectID(fablabId),
         "jobs.details": {$elemMatch: {"jobs": {$elemMatch: {"id": jobId}}}}},
    	{ $pull: { "jobs.details.$.jobs": {"id": jobId} }, $inc : {"jobs.queued": -1}}
    , callback);
}

exports.deleteJob = deleteJob;