var request = require('request');

function postFabLab (req, res) {
	var fablab = req.body;

    if (checkFields(fablab)){
        var fablabObj = {
                'location':{
                    'type': "Point",
                    'coordinates': [fablab.coordinates.longitude, fablab.coordinates.latitude]
                },
                'api': fablab.api,
                'port': fablab.port || 80,
                'jobs': {
                    'running': 0,
                    'queued': 0,
                    'details': []
                },
                'name': fablab.name,
                'web': fablab.web,
                'capacity': fablab.capacity,
                'address': fablab.address,
                'contact': fablab.contact,
                'openingDays': fablab.openingDays,
                'equipment': fablab.equipment,
                'materials': fablab.materials,
            }
        for (machine in fablab.equipment){
            fablabObj.jobs.details.push({
                'machineId': fablab.equipment[machine].id,
                'type': fablab.equipment[machine].type,
                'vendor': fablab.equipment[machine].vendor,
                'jobs': []
            })
        }
        if (fablab.id){
            fablabObj._id = require('mongodb').ObjectID(fablab.id);
        }
        req.db.collection('fablabs').save(fablabObj, {"upsert":true}, function(err, docs) {
                if (err){
                    res.status(500);
                    res.json(err);
                }else{
                    if(docs.ops){ //Created
                        res.json({"id":docs.ops[0]._id});
                    }else{
                        res.json({"id":fablab.id});
                    }
                }
            });
    }else{
        res.status(400);
        res.json({'err': 'Incomplete fablab info'});
    }
}

function checkFields (fablab){
    if (
        fablab
        && "coordinates" in fablab
        && "latitude" in fablab.coordinates
        && "longitude" in fablab.coordinates
        && "name" in fablab
        && "web" in fablab
        && "api" in fablab
        && "capacity" in fablab
        && "address" in fablab
        && "street" in fablab.address
        && "postCode" in fablab.address
        && "state" in fablab.address
        && "country" in fablab.address
        && "countryCode" in fablab.address
        && "contact" in fablab
        && "name" in fablab.contact
        && "charge" in fablab.contact
        && "email" in fablab.contact
        && "openingDays" in fablab
        && "equipment" in fablab
        && "materials" in fablab
    ){
        return true;
    }else{
        return false;
    }
}

exports.postFabLab = postFabLab;