var request = require('request');
var checkToken = require('../helpers/permissions').checkTokenPermissions;

var tokenFablab="eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Ik1qQkVSalJETXpZMFFqYzJOemxDTWpVek1EYzJORVpDTWtSRlJUTTVOVUUyTWtRMU1rSkNOUSJ9.eyJodHRwczovL3Rlc3RuZXd0b24uZXUuY29tL2FwcF9tZXRhZGF0YSI6eyJ1c2VyIjp0cnVlLCJmYWJsYWIiOnRydWV9LCJuaWNrbmFtZSI6IndvbG9sbyIsIm5hbWUiOiJ3b2xvbG9AYWVvZW8uY29tIiwicGljdHVyZSI6Imh0dHBzOi8vcy5ncmF2YXRhci5jb20vYXZhdGFyLzE0NjViZTZhZWEzM2IwNTU2MTA1MTJiNWIyZGU4MGI5P3M9NDgwJnI9cGcmZD1odHRwcyUzQSUyRiUyRmNkbi5hdXRoMC5jb20lMkZhdmF0YXJzJTJGd28ucG5nIiwidXBkYXRlZF9hdCI6IjIwMTctMTEtMThUMDA6MDY6MzQuNTI3WiIsImVtYWlsIjoid29sb2xvQGFlb2VvLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwiaXNzIjoiaHR0cHM6Ly90ZXN0bmV3dG9uLmV1LmF1dGgwLmNvbS8iLCJzdWIiOiJhdXRoMHw1YTBiMWRiNjA2NmUyZDE4MzhmZGFiMTgiLCJhdWQiOiJKUmNRbUJKcE44NDNXRW1wMjQwYmZIbW9nejhRNlNuUyIsImlhdCI6MTUxMDk2MzU5NCwiZXhwIjoxNTEwOTk5NTk0fQ.wFqnFzR3dGm9QXgdcFgbFw0TZnZw7VfxYvRyhnq1EjA_Ojhmt6bJdil8ux-RmdKC9s-aS8h0l1T2qzp3uQQMskdvUO_BjIXbJjxA_o-22u3E1vKsjE-eBGeLc9W7LtelbPQrYRZKdTIy4t6qTO4T7ZiA8G7JkjtXE0DfE-pdkF_cD1IFHBp-CziyXgbEyNUfpx06ESJ_qU8xffTufr-9MIYv-T-WecDwHs8UUS4M4oDlDzpLTrJ8aSpuxWnZkfyY2Rv24MijvMWOsa_E7Yi0Y_xkaytbzpIviWXYwr-aYtCQaf1BgXuiiIkFzIpcEEE9ucCJFIbYwXdV9uaZWHF-ng"
var tokenUser="eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Ik1qQkVSalJETXpZMFFqYzJOemxDTWpVek1EYzJORVpDTWtSRlJUTTVOVUUyTWtRMU1rSkNOUSJ9.eyJodHRwczovL3Rlc3RuZXd0b24uZXUuY29tL2FwcF9tZXRhZGF0YSI6eyJ1c2VyIjp0cnVlfSwibmlja25hbWUiOiJ3b2xvbG8iLCJuYW1lIjoid29sb2xvQGFlb2VvLmNvbSIsInBpY3R1cmUiOiJodHRwczovL3MuZ3JhdmF0YXIuY29tL2F2YXRhci8xNDY1YmU2YWVhMzNiMDU1NjEwNTEyYjViMmRlODBiOT9zPTQ4MCZyPXBnJmQ9aHR0cHMlM0ElMkYlMkZjZG4uYXV0aDAuY29tJTJGYXZhdGFycyUyRndvLnBuZyIsInVwZGF0ZWRfYXQiOiIyMDE3LTExLTE4VDExOjMzOjA4LjMzMVoiLCJlbWFpbCI6IndvbG9sb0BhZW9lby5jb20iLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImlzcyI6Imh0dHBzOi8vdGVzdG5ld3Rvbi5ldS5hdXRoMC5jb20vIiwic3ViIjoiYXV0aDB8NWEwYjFkYjYwNjZlMmQxODM4ZmRhYjE4IiwiYXVkIjoiSlJjUW1CSnBOODQzV0VtcDI0MGJmSG1vZ3o4UTZTblMiLCJpYXQiOjE1MTEwMDQ3ODgsImV4cCI6MTUxMTA0MDc4OH0.c6FUBUvcDJiArDTivM3FiXtmYltlbI4S5sBSkAprUP9syKnQnhgqwVBN1b1d4f8Chm1NB--KIZsxjTFCysMMw09RcC5OX7D7tdYctUXD6q0DeYpdFbMqDRYwTRH-PuBHPOUS9yzN8WQ_pLS4kcFCKHJXvGxtrdGsGFofB_k-y7fspgfzvvJG7SZaimn2uQI2WJp0WqnyFPKCykDUyPyERHy676-hybxBdoGwita0-cbm2EjzgMnaXdkOMIBhfc8NuLcKpXLyFHHB368BqUgG7Sil9CuazHiVA0T0QhJzIcAzm8_qtvc-jSMkrUwpfPa1gmDMqS_IR8jPGioyO6oAyw"


function connectFabLab (req, res) {
	var fablabObj = req.body;
    checkToken(tokenFablab, "fablab", function(authorized, payload){
        if (authorized && payload){
            if (checkFields(fablabObj)){
                req.db.collection('fablabs').findOne({_id: require('mongodb').ObjectID(fablabObj.id)}, function(err, fablab){
                        if (err){
                            res.status(500);
                            res.json(err);
                        }else if (!fablab){
                            res.status(400);
                            res.json({'err': 'Fablab not found'});
                        }else{
                            if (payload.sub == fablab.userid){ //Check if userID in token corresponds with thee fablab userID
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
                                            req.db.collection('fablabs').update({_id: require('mongodb').ObjectID(fablabObj.id)}, {$set:fablab}, function(err, docs) {
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
                                res.status(403);
                                res.json({'err': 'Unauthorized'});
                            }
                        }
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
    port: 8080,
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
                		"type": "Milling machine",
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
                fablabObj._id = require('mongodb').ObjectID(fablab.id);
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
exports.registerServices = registerServices;