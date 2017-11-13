var request = require('request');

function postService (req, res) {
    var service = req.body;

    if (checkFields(service)){
        var id = require('mongodb').ObjectID(service.id);
        req.db.collection('fablabs').findOne({'_id': id}, function(err, doc) {
            if (err){
                res.status(500);
                res.json(err);
            }else{
                if (doc){
                    addConsulService(doc, service, function(err, body){
                        res.json(body);
                    })
                }else{
                    res.status(400);
                    res.json({'err': 'Fablab not found'});
                }
            }
        });
    }else{
        res.status(400);
        res.json({'err': 'Incomplete JSON'});
    }
}

function addConsulService(fablab, service, callback){
    if (service.material){
        for (var m in service.material){
            service.material[m] = service.material[m].toLowerCase();
        }
    }else{
        service.material = [];
    }
    request.post({
        method: 'POST',
        uri: process.env.CONSUL_ADDR +'/v1/agent/service/register',
        json: {
                "ID": fablab._id + "_" + service.machine.toLowerCase(),
                "Name": service.machine.toLowerCase(),
                "Tags": service.material,
                "EnableTagOverride": true,
                "Address": fablab.api,
                "Port": fablab.port,
                "check": {
                  "http": "http://"+fablab.api+":"+fablab.port,
                  "interval": "10s",
                  "timeout": "1s"
                 }
              }
    }, function(err, res, body) {
                    if (!body){
                        body = {};
                    }
                    callback (err, body);
                });
}

function checkFields (service){
    if (
        service
        && "id" in service
        && "machine" in service
        && "material" in service
    ){
        return true;
    }else{
        return false;
    }
}

exports.postService = postService;
