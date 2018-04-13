var checkToken = require('../helpers/permissions');
var getUserId = checkToken.getUserId;

function getJob(req, res){
    var token = req.get("Authentication");
    checkToken.checkToken(token, function(authorized, payload){
        if (authorized && payload){
            var userId = req.get("newtonUser") || getUserId(req.get("Authentication"));
            var options = {
                limit : 20,
                skip : 0
            }
            if (req.query.limit){
                options.limit = parseInt(req.query.limit)
            }
            if (req.query.offset){
                options.skip = parseInt(req.query.offset)
            }
            req.db.collection('jobs').find({'userId' : userId}, options).toArray(function(err, docs) {
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