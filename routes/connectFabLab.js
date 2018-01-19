var request = require('request');
var checkToken = require('../helpers/permissions');
//var getAndUpdateFablabJobs = require('../resources/refreshJobs').getAndUpdateFablabJobs;

function connectFabLab (req, res) {
    var token = req.get("Authentication");
	var fablabObj = req.body;
    checkToken.checkTokenPermissions(token, "fablab", function(authorized, payload){
        if (authorized && payload){
            if (checkFields(fablabObj)){
                req.db.collection('fablabs').findOne({userid: payload.sub}, function(err, incompleteFablab){
                        if (err){
                            res.status(500);
                            res.json(err);
                        }else if (!incompleteFablab){
                            res.status(400);
                            res.json({'err': 'Fablab not found'});
                        }else{
                            /*checkToken.checkTokenUser(token, fablab.userid, function(authorized, payload){ //Check if userID in token corresponds with the fablab userID
                                if (authorized && payload){
                            */
                                    incompleteFablab.api = fablabObj.api;
                                    incompleteFablab.port = fablabObj.port || 80;
                                    getFablabInfo(incompleteFablab, function(err, fablab){
                                        if (err){
                                            res.json(err);
                                        }else{
                                            var auxMaterials = [];
                                            for (var mat in fablab.materials){
                                                auxMaterials.push(fablab.materials[mat].type);
                                            }
                                            var auxMachines = JSON.parse(JSON.stringify(fablab.equipment));
                                            registerServices(fablab, auxMachines, auxMaterials, function(err){
                                                if (err){
                                                    res.status(500);
                                                    res.json(err);
                                                }else{
                                                    delete fablab._id;
                                                    req.db.collection('fablabs').update({_id: require('mongodb').ObjectID(incompleteFablab._id)}, {$set:fablab}, function(err, docs) {
                                                        if (err){
                                                            res.status(500);
                                                            res.json(err);
                                                        }else{
                                                            fablab._id = incompleteFablab._id;
                                                            req.refreshJobs.getAndUpdateFablabJobs(fablab);
                                                            res.json(fablab);
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                    });
                        /*        }else{
                                    res.status(403);
                                    res.json({'err': 'Unauthorized'});
                                }
                            });
                        */}
                });
            }else{
                res.status(400);
                res.json({'err': 'Incomplete fablab info'});
            }
        }else{
            res.status(403);
            res.json({'err': 'Unauthorized'});
        }
    });
}

function getFablabInfo(fablab, callback){
    var req = request.get({url: 'http://'+fablab.api+ ":" + fablab.port + '/fablab/'}, function(err, res, body) {
        if (err){
            callback (err);
        }else{
            try {
                var fablabWrapper = JSON.parse(body);
            } catch (e) {
                console.log(e);
                console.log(body);
            }
            if (fablabWrapper){
                var fablabObj = fablabWrapper.fablab;
                if (fablabObj.coordinates){
                    fablabObj.jobs = fablabWrapper.jobs;
                    fablabObj._id = require('mongodb').ObjectID(fablab._id);
                    fablabObj.api = fablab.api;
                    fablabObj.port = fablab.port;
                    fablabObj.location = {
                                        'type': "Point",
                                        'coordinates': [parseFloat(fablabObj.coordinates.longitude), parseFloat(fablabObj.coordinates.latitude)]
                                    }
                    delete fablabObj.coordinates.longitude;
                    delete fablabObj.coordinates.latitude;
                    delete fablabObj.coordinates;
                    delete fablabObj.id;
                    callback(null, fablabObj);
                }else{
                    callback({"message": "Incomplete fablab"});
                }
            }else{
                callback({"message": "fablab not found", "response": body});
            }
        }
    });
}

function registerServices(fablab, machines, materials, callback){
    var nextMachine = machines.pop();
    if (nextMachine){
        addConsulService(fablab, {machine: nextMachine.type, material: materials}, function(err, body){
            if (err){
                callback(err);
            }else{
                registerServices(fablab, machines, materials, callback);
            }
        })
    }else{
        callback(null);
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
                  "http": "http://"+fablab.api+":"+fablab.port /*TEST*/ + "/fablab",
                  "interval": "30s",
                  "timeout": "1s"
                 }
              }
    }, function(err, res, body) {
                    if (!body){
                        body = {};
                    }
                    console.log(process.env.CONSUL_ADDR +'/v1/agent/service/register')
                    console.log({
                                                "ID": fablab._id + "_" + service.machine.toLowerCase(),
                                                "Name": service.machine.toLowerCase(),
                                                "Tags": service.material,
                                                "EnableTagOverride": true,
                                                "Address": fablab.api,
                                                "Port": fablab.port,
                                                "check": {
                                                  "http": "http://"+fablab.api+":"+fablab.port /*TEST*/ + "/fablab",
                                                  "interval": "30s",
                                                  "timeout": "1s"
                                                 });
                    console.log(err);
                    console.log(body);
                    callback (err, body);
                });
}

function checkFields (fablab){
    if (
        fablab
        //&& "id" in fablab
        && "api" in fablab
    ){
        return true;
    }else{
        return false;
    }
}

exports.connectFabLab = connectFabLab;
exports.registerServices = registerServices;