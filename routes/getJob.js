var getUserId = require('../helpers/permissions').getUserId;

function getJob(req, res){
    var options = {
	    limit : 10,
	    skip : 0
	}

    req.db.collection('jobs').find({'userId' : getUserId(req.get("Authentication"))}, options).toArray(function(err, docs) {
        if (err){
            res.status(500);
            res.json(err);
        }else{
            res.json(docs);
        }
    });
}

exports.getJob = getJob;