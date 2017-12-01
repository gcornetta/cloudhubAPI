const WebSocket = require('ws');
const request = require('request');
const mongoUtil = require('./db');
const registerConsulServices = require('../routes/connectFabLab').registerServices;

var db = mongoUtil.getDB();

const wss = new WebSocket.Server({ port: 3333 });

wss.on('connection', function connection(ws) {

  ws.on('message', function incoming(message) {
    var msg = JSON.parse(message);
    db.collection('fablabs').findOne({_id: require('mongodb').ObjectID(msg.fablabId)}, function(err, fablab){
        if (err){
            ws.send(JSON.stringify(err));
        }else if (!fablab){
            ws.send(JSON.stringify({err: "Fablab not found"}));
        }else{
            switch (msg.event){
                case "serviceUp": //(fablabId, machineId)
                    var auxMaterials = [];
                    for (var mat in fablab.materials){
                        auxMaterials.push(fablab.materials[mat].type);
                    }
                    registerConsulServices(fablab, fablab.equipment, auxMaterials, function(err){
                        if (err){
                            ws.send(JSON.stringify(err));
                        }else{
                           ws.send(JSON.stringify({msg: "Service added successfully"}));
                        }
                    });
                break;
                case "serviceDown": //(fablabId, machineId)
                    for (var machine in fablab.equipment){
                        if (fablab.equipment[machine].id == msg.machineId){
                            deregisterServices(fablab, [fablab.equipment[machine]], function(err){
                                if (err){
                                    ws.send(JSON.stringify(err));
                                }else{
                                    ws.send(JSON.stringify({msg: "Service deleted successfully"}));
                                }
                            });
                            break;
                        }
                    }
                break;
                case "fablabDown": //(fablabId)
                    deregisterServices(fablab, fablab.equipment, function(err){
                        if (err){
                            ws.send(JSON.stringify(err));
                        }else{
                           ws.send(JSON.stringify({msg: "Services deleted successfully"}));
                        }
                    });
                break;
                case "stateChange": //(fablabId, machineId, status)
                    for (var machine in fablab.equipment){
                        if (fablab.equipment[machine].id == msg.machineId){
                            fablab.equipment[machine].status = msg.status;
                            break;
                        }
                    }
                    db.collection('fablabs').save(fablab, {"upsert":true}, function(err, docs) {
                        if (err){
                            ws.send(JSON.stringify(err));
                        }else{
                           ws.send(JSON.stringify({msg: "Status updated"}));
                        }
                    });
                break;
            }
        }
    });
  });
});

function deregisterServices(fablab, machines, callback){
    var nextMachine = machines.pop();
    if (nextMachine){
        deregisterConsulService(fablab, {machine: nextMachine.type}, function(err, body){
            if (err){
                callback(err);
            }else{
                deregisterServices(fablab, machines, callback);
            }
        })
    }else{
        callback(null);
    }
}

function deregisterConsulService(fablab, service, callback){
    request.post({
        method: 'POST',
        uri: process.env.CONSUL_ADDR +'/v1/agent/service/deregister/'+fablab._id + "_" + service.machine.toLowerCase()
    }, function(err, res, body) {
                    if (!body){
                        body = {};
                    }
                    callback (err, body);
                });
}