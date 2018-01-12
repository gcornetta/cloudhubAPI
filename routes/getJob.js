var checkToken = require('../helpers/permissions');
var getUserId = checkToken.getUserId;

function getJob(req, res){
    var token = req.get("Authentication");
    checkToken.checkToken(token, function(authorized, payload){
        if (authorized && payload){
            var userId = req.query.newtonUser || getUserId(req.get("Authentication"));
            req.db.collection('jobs').find({'userId' : userId}).toArray(function(err, docs) {
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

exports.getJob = getJob;