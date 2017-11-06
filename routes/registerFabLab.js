var request = require('request');

function registerFabLab (req, res) {
	var fablab = req.body;

    if (checkFields(fablab)){
        req.db.collection('fablabs').insert(
            {
                'location':{
                    'type': "Point",
                    'coordinates': [fablab.coordinates.longitude, fablab.coordinates.latitude]
                },
                'address': fablab.address,
                'port': fablab.port
            },
            function(err, docs) {
                if (err){
                    res.json(err);
                }else{
                    res.json({"id":docs.ops[0]._id});
                }
            });
    }else{
        res.json({'err': 'Incomplete fablab info'});
    }
}

function checkFields (fablab){
    if (
        fablab
        && "coordinates" in fablab
        && "latitude" in fablab.coordinates
        && "longitude" in fablab.coordinates
        && "address" in fablab
        && "port" in fablab

        /*& fablab.name
        & fablab.web
        & fablab.api
        & fablab.capacity
        & fablab.address
        & fablab.address.street
        & fablab.address.postCode
        & fablab.address.state
        & fablab.address.country
        & fablab.address.countryCode
        & fablab.contact
        & fablab.contact.name
        & fablab.contact.charge
        & fablab.contact.email
        & fablab.openingDays
        & fablab.equipment
        & fablab.materials
        & fablab.jobs*/
    ){
        return true;
    }else{
        return false;
    }
}

exports.registerFabLab = registerFabLab;