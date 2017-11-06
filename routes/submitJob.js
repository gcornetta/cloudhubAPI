var request = require('request');

function submitJob (req, res) {
	var job = req.query;

	checkConsulServers(job.machine, job.material, function (err, data){
        if (err){
            res.json(err);
        }else{
	        //var resultMap = {};
	        var resultArray = [];
	        for (var i in data){
    	        if(data[i].ServiceID){
    	            data[i].ServiceID = require('mongodb').ObjectID(data[i].ServiceID.slice(0, data[i].ServiceID.indexOf("_")));
	                //resultMap[data[i].ServiceID] = data[i];
	                resultArray.push(data[i].ServiceID);
    	        }
	        }
	        console.log("getnearest")
	        getNearestFabLab(req.db, job, resultArray, function(err, doc) {
                if (err){
                    res.json(err);
                }else{
                    if (doc){
                        res.json(doc);
                    }else{
                        res.json({'err': 'No fablabs available'})
                    }
                }
            });
	    }
	})
}

function checkConsulServers(service, tag, callback){
    request.post(process.env.CONSUL_ADDR +'/v1/catalog/service/'+service+"?tag="+tag, function(err, res, body) {
                    if (!body){
                        body = {};
                    }
                    callback (err, JSON.parse(body));
                });
}

function getNearestFabLab(db, job, serversUp, callback){
    console.log(job)
    console.log(serversUp)
    db.collection('fablabs').findOne({
        "_id": {$in: serversUp},
    	"location":
            { $near :
                {
                    $geometry: { type: "Point",  coordinates: [ parseFloat(job.long), parseFloat(job.lat) ] }
                }
            }
    }, callback);
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

exports.submitJob = submitJob;