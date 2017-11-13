var request = require('request');

function getFabLabs (req, res) {
	var query = {};
	var options = {
	    limit : 10,
	    skip : 0
	}
	if (req.params.fablabId){
        query = {'_id': require('mongodb').ObjectID(req.params.fablabId)}
	}
	if (req.query.limit){
        options.limit = parseInt(req.query.limit)
	}
	if (req.query.offset){
        options.skip = parseInt(req.query.offset)
	}

    req.db.collection('fablabs').find(query, options).toArray(function(err, docs) {
        if (err){
            res.status(500);
            res.json(err);
        }else{
            if (req.query.job){
                getJob(req.db, req.params.fablabId, req.query.job, function(err, doc){
                    if (err){
                        res.status(500);
                        res.json(err);
                    }else{
                        res.json(doc);
                    }
                })
            }else if (req.params.fablabId){
                res.json(docs);
            }else{
                req.db.collection('fablabs').count(function(err, count) {
                    if (err){
                        res.status(500);
                        res.json(err);
                    }else{
                        var retValue = {
                            "fablabs": docs,
                            "_metadata": {
                                "totalCount": count,
                                "limit": options.limit,
                                "offset": options.skip
                            }
                        }
                        res.json(retValue);
                    }
                });
            }
        }
    });
}

function getJob(db, fablabId, jobId, callback){
    db.collection('fablabs').findOne({
        "_id": require('mongodb').ObjectID(fablabId),
        "jobs.details": {$elemMatch: {"jobs": {$elemMatch: {"id": jobId}}}}}
    , callback);
}

exports.getFabLabs = getFabLabs;