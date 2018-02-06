const WebSocket = require('ws');
const request = require('request');
const mongoUtil = require('./db');
const registerConsulServices = require('../routes/connectFabLab').registerServices;

var db = mongoUtil.getDB();

const wss = new WebSocket.Server({ port: 3333 });

wss.on('connection', function connection(ws) {

  ws.on('message', function incoming(message) {
    var msg = JSON.parse(message);
    db.collection('fablabs').findOne({id: msg.id}, function(err, fablab){
        if (err){
            ws.send(JSON.stringify(err));
        }else if (!fablab){
            ws.send(JSON.stringify({err: "Fablab not found"}));
        }else{
            checkToken.checkTokenWS(msg.token, function(authorized, payload){
                if (authorized){
                    switch (msg.event){
                        case "serviceUp": //(fablabId, machineId)
                            console.log("serviceUp");
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
                            console.log("serviceDown");
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
                        case "fabLabDown": //(fablabId)
                            console.log("fablabDown");
                            deregisterServices(fablab, fablab.equipment, function(err){
                                if (err){
                                    ws.send(JSON.stringify(err));
                                }else{
                                   ws.send(JSON.stringify({msg: "Services deleted successfully"}));
                                }
                            });
                        break;
                        case "machineStateChange": //(fablabId, machineId, status)
                            console.log("machineStateChange");
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
            })
        }
    });
  });
});

function deregisterServices(fablab, machines, callback){
    var nextMachine = machines.pop();
    if (nextMachine){
        deregisterConsulService(fablab, {machine: nextMachine.type}, 10, function(err, body){
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

function deregisterConsulService(fablab, service, retries, callback){
    request({
        method: 'PUT',
        uri: process.env.CONSUL_ADDR +'/v1/agent/service/deregister/'+fablab._id + "_" + service.machine.toLowerCase()
    }, function(err, res, body) {
                    if ((body || err)&&(retries > 0)){
                        deregisterConsulService(fablab, service, retries-1, callback)
                    }else{
                        if (body && (!err)){
                            err = body;
                        }
                        callback (err, body);
                    }
                });
}