var request = require('request');
var checkToken = require('../helpers/permissions');

function getJobsQuery (req, res) {
    var token = req.get("Authentication");
    checkToken.checkToken(token, function(authorized, payload){
        if (authorized && payload){
            var query = {};
            var fields = {};
            var options = {
                limit : 10,
                skip : 0
            }
            if (req.params.fablabId){
                query = {'fablabId': require('mongodb').ObjectID(req.params.fablabId)}
            }
            if (req.query.limit){
                options.limit = parseInt(req.query.limit)
            }
            if (req.query.offset){
                options.skip = parseInt(req.query.offset)
            }
            if (req.query.fields){
                var fieldsArray = req.query.fields.split(',');
                for (var i=0; i<fieldsArray.length; i++){
                    fields[fieldsArray[i]]=true;
                }
            }if (req.query.q){
                var queryArray = req.query.q.split('+');
                if (queryArray.length > 0){
                    for (var i=0; i<queryArray.length; i++){
                        switch (queryArray[i]){
                            case "Laser cutter":
                            case "laser cutter":
                            case "Vinyl cutter":
                            case "vinyl cutter":
                            case "Milling machine":
                            case "milling machine":
                            case "3D printer":
                            case "3D Printer":
                            case "3d Printer":
                            case "3d printer":
                                query.machine = queryArray[i];
                                break;
                            case "pending":
                            case "queued":
                            case "running":
                            case "paused":
                            case "cancelled":
                                query.status = queryArray[i];
                                break;
                        }
                    }
                }
            }

            req.db.collection('jobs').find(query, options).project(fields).toArray(function(err, docs) {
                    if (err){
                        res.status(500);
                        res.json(err);
                    }else{
                        res.json(docs);
                    }
            });
        }else{
            res.status(403);
            res.json({'err': 'Unauthorized'});
        }
    });
}

exports.getJobsQuery = getJobsQuery;