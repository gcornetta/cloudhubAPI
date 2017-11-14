var request = require('request');

function connectFabLab (req, res) {
	var fablabObj = req.body;

    if (checkFields(fablabObj)){
        getFablabInfo(fablabObj, function(err, fablab){
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
                    req.db.collection('fablabs').save(fablab, {"upsert":true}, function(err, docs) {
                        if (err){
                            res.status(500);
                            res.json(err);
                        }else{
                            res.json({"result":docs.result.n});
                        }
                    });
                }
            });
        });
    }else{
        res.status(400);
        res.json({'err': 'Incomplete fablab info'});
    }
}

function getFablabInfo(fablab, callback){
    /*var req = request.get({url: 'http://'+fablab.api + '/fablab/'}, function(err, res, body) {
        if (err){
            callback (err);
        }else{
            if (body){
                var fablabWrapper = JSON.parse(body);
                var fablabObj = fablabWrapper.fablab;
                fablabObj.jobs = fablabWrapper.jobs;
                fablabObj._id = require('mongodb').ObjectID(fablabObj.id);
                fablabObj.api = fablab.api;
                fablabObj.port = fablab.port || fablabObj.port || 80;
                delete fablabObj.id;
                fablabObj.location = {
                                    'type': "Point",
                                    'coordinates': [fablabObj.coordinates.longitude, fablabObj.coordinates.latitude]
                                }
                delete fablabObj.coordinates.longitude;
                delete fablabObj.coordinates.latitude;
                for (machine in fablabObj.equipment){
                    fablabObj.jobs.details.push({
                        'machineId': fablabObj.equipment[machine].id,
                        'type': fablabObj.equipment[machine].type,
                        'vendor': fablabObj.equipment[machine].vendor,
                        'jobs': []
                    })
                }
                callback(null, fablabObj);
            }else{
                callback({"message": "fablab not found"});
            }
        }
    });*/

    //TEST
let fablabWrapper = {
  fablab: {
    id: '5a05d341e3de134066da700d',
    name: 'FabLab@CEU',
    web: 'http://www.xxxxxx',
    capacity: 0,
    address: {
      street: 'Avda. de Montepríncipe S/N',
      postCode: '28668',
      state: 'Madrid',
      country: 'Spain',
      countryCode: 'ES'
    },
    coordinates: {
      latitude: 40.3999665,
      longitude: -3.8354167
    },
    contact: {
      name: 'Covadonga Lorenzo',
      charge: 'Fab Lab Directress',
      email: 'clorenzo@ceu.es'
    },
    openingDays: [
      {day: 'monday', from: '9:00', to: '17:00'},
      {day: 'tueday', from: '9:00', to: '17:00'},
      {day: 'wednday', from: '9:00', to: '17:00'},
      {day: 'thursday', from: '9:00', to: '17:00'},
      {day: 'friday', from: '9:00', to: '17:00'}
    ],
    equipment: [{"id": "1a234bc",
                		"type": "milling machine",
                		"vendor": "roland",
                		"name": "ñalskdfj",
                		"status": "waiting",
                		"jobsQueued": 0},
                		{"id": "2b234zz",
                		"type": "3D printer",
                		"vendor": "prusa",
                		"name": "añlasdfj",
                		"status": "waiting",
                		"jobsQueued": 0}],
    materials: [{"type": "wood",
                		"quantity": 100
                		}]
  },
  jobs: {
    running: 0,
    queued:  0,
    details: []
  }
}
var fablabObj = fablabWrapper.fablab;
                fablabObj.jobs = fablabWrapper.jobs;
                fablabObj._id = require('mongodb').ObjectID(fablabObj.id);
                delete fablabObj.id;
                fablabObj.api = fablab.api;
                fablabObj.port = fablab.port || fablabObj.port || 80;
                fablabObj.location = {
                    'type': "Point",
                    'coordinates': [fablabObj.coordinates.longitude, fablabObj.coordinates.latitude]
                }
                delete fablabObj.coordinates.longitude;
                delete fablabObj.coordinates.latitude;
for (machine in fablabObj.equipment){
                    fablabObj.jobs.details.push({
                        'machineId': fablabObj.equipment[machine].id,
                        'type': fablabObj.equipment[machine].type,
                        'vendor': fablabObj.equipment[machine].vendor,
                        'jobs': []
                    })
                }
                callback(null, fablabObj);
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

function checkFields (fablab){
    if (
        fablab
        && "id" in fablab
        && "api" in fablab
    ){
        return true;
    }else{
        return false;
    }
}

exports.connectFabLab = connectFabLab;