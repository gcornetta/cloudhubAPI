var jws = require('jws-jwk');
var jwt = require('jsonwebtoken');
var request = require('request');

var jwks;
//TEST
jwks = { keys:
              [ { alg: 'RS256',
                  kty: 'RSA',
                  use: 'sig',
                  x5c: [Object],
                  n: 'wedXzypBiUrrjOdNLuCEh8waL1l5bNV5utgt3bCfe6IBZwUClgh-pd5S2YPRoGu2swNXnlLFsTD1jK8VNaAI3Al2k62TNAtMgmkoSniWjgMCuT_It8Vyegi89F0bEQ0aEkX7me5hlI-Q1QZ-Q4LS7l4XjzwvZJlT63OH1hV8Vf0SIFS52WHedcAbhq6CJRsVx4p5XPZonv3S_FoTCyg8QIMu9Be6Mp01DI3n5HIyyjlvjSqFIch7B9aHVG76xDEW7djj2IF6BG7sjqnkFoNmUdA3K1SuOtsnRsaBwDTeBU1n9t5VD2ZIxHE7-beVyLLnktZ0graWnfFlQITapWlE9Q',
                  e: 'AQAB',
                  kid: 'MjBERjRDMzY0Qjc2NzlCMjUzMDc2NEZCMkRFRTM5NUE2MkQ1MkJCNQ',
                  x5t: 'MjBERjRDMzY0Qjc2NzlCMjUzMDc2NEZCMkRFRTM5NUE2MkQ1MkJCNQ' } ] };

//TODO: Invalid token
//TODO: URL metadata in env
module.exports.checkTokenPermissions = function(token, permission, callback){
    if (!jwks){
        getJWKS(function(err, jwksRet){
            jwks = jwksRet;
            if (jws.verify(token, jwks.keys[0], {algorithms: 'RS256'})) {
                var decoded = jwt.decode(token);
                if (decoded['https://testnewton.eu.com/app_metadata'][permission]){
                    callback(true, decoded);
                }else{
                    callback(false);
                }
            }else{
                callback(false);
            }
        })
    }else{
            if (jws.verify(token, jwks.keys[0], {algorithms: 'RS256'})) {
                var decoded = jwt.decode(token);
                if (decoded['https://testnewton.eu.com/app_metadata'].fablab){
                    callback(true, decoded);
                }else{
                    callback(false);
                }
            }else{
                callback(false);
            }
    }


}

function getJWKS(callback){
    request.get({method: 'GET', uri: "https://"+process.env.AUTH0_DOMAIN +'/.well-known/jwks.json'}, function(err, res, body) {
        if (!body){
            body = {};
        }
        callback (err, JSON.parse(body));
    });
}