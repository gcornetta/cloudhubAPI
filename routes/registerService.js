var request = require('request');

function registerService (req, res) {
    var service = req.body;

    if (checkFields(service)){
        var id = require('mongodb').ObjectID(service.id);
        req.db.collection('fablabs').findOne({'_id': id}, function(err, doc) {
            if (err){
                res.json(err);
            }else{
                addConsulService(doc, service, function(err, body){
                    res.json(body);
                })
            }
        });
    }else{
        res.json({'err': 'Incomplete JSON'});
    }
}

function addConsulService(fablab, service, callback){
    request.post({
        method: 'POST',
        uri: process.env.CONSUL_ADDR +'/v1/agent/service/register',
        json: {
                "ID": fablab._id + "_" + service.machine,
                "Name": service.machine,
                "Tags": service.material,
                "EnableTagOverride": true,
                "Address": fablab.address,
                "Port": fablab.port,
                "check": {
                  "http": "http://"+fablab.address+":"+fablab.port,
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

exports.registerService = registerService;
