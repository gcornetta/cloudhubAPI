var request = require('request');
var checkToken = require('../helpers/permissions');

function getFabLabs (req, res) {
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
                query = {'_id': require('mongodb').ObjectID(req.params.fablabId)}
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
                    query.equipment = {$elemMatch:{}};
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
                                query.equipment.$elemMatch.type = queryArray[i];
                                break;
                            case "Epilog":
                            case "epilog":
                            case "GCC":
                            case "Trotec":
                            case "trotec":
                            case "Roland":
                            case "roland":
                            case "Prusa":
                            case "prusa":
                                query.equipment.$elemMatch.vendor = queryArray[i];
                                break;
                        }
                    }
                }
            }

            req.db.collection('fablabs').find(query, options).project(fields).toArray(function(err, docs) {
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
        }else{
            res.status(403);
            res.json({'err': 'Unauthorized'});
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