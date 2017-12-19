var jws = require('jws-jwk');
var jwt = require('jsonwebtoken');
var request = require('request');

var jwks;
//TEST
/*jwks = { keys:
              [ { alg: 'RS256',
                  kty: 'RSA',
                  use: 'sig',
                  x5c: [Object],
                  n: 'wedXzypBiUrrjOdNLuCEh8waL1l5bNV5utgt3bCfe6IBZwUClgh-pd5S2YPRoGu2swNXnlLFsTD1jK8VNaAI3Al2k62TNAtMgmkoSniWjgMCuT_It8Vyegi89F0bEQ0aEkX7me5hlI-Q1QZ-Q4LS7l4XjzwvZJlT63OH1hV8Vf0SIFS52WHedcAbhq6CJRsVx4p5XPZonv3S_FoTCyg8QIMu9Be6Mp01DI3n5HIyyjlvjSqFIch7B9aHVG76xDEW7djj2IF6BG7sjqnkFoNmUdA3K1SuOtsnRsaBwDTeBU1n9t5VD2ZIxHE7-beVyLLnktZ0graWnfFlQITapWlE9Q',
                  e: 'AQAB',
                  kid: 'MjBERjRDMzY0Qjc2NzlCMjUzMDc2NEZCMkRFRTM5NUE2MkQ1MkJCNQ',
                  x5t: 'MjBERjRDMzY0Qjc2NzlCMjUzMDc2NEZCMkRFRTM5NUE2MkQ1MkJCNQ' } ] };*/

module.exports.checkTokenPermissions = function(token, permission, callback){
    if (token){
        token = validToken(token);
        try {
            var decoded = jwt.decode(token);
        } catch (e) {
            console.log(e);
        }
        if (decoded){
            if (tokenExpired(decoded)){
                callback(false);
            }else{
                if (!jwks){
                    getJWKS(function(err, jwksRet){
                        jwks = jwksRet;
                        if (jws.verify(token, jwks.keys[0], {algorithms: 'RS256'})) {
                            if (decoded[process.env.METADATA_URL][permission]){
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
                            if (decoded[process.env.METADATA_URL][permission]){
                                callback(true, decoded);
                            }else{
                                callback(false);
                            }
                        }else{
                            callback(false);
                        }
                }
            }
        }else{
            callback(false);
        }
    }else{
        callback(false);
    }
}

module.exports.checkTokenUser = function(token, userId, callback){
    if (token){
        token = validToken(token);
        try {
            var decoded = jwt.decode(token);
        } catch (e) {
            console.log(e);
        }
        if (decoded){
           if (tokenExpired(decoded)){
                callback(false);
            }else{
                if (!jwks){
                    getJWKS(function(err, jwksRet){
                        jwks = jwksRet;
                        if (jws.verify(token, jwks.keys[0], {algorithms: 'RS256'})) {
                            if ((decoded)&&(decoded.sub === userId)){
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
                        if ((decoded)&&(decoded.sub === userId)){
                            callback(true, decoded);
                        }else{
                            callback(false);
                        }
                    }else{
                        callback(false);
                    }
                }
            }
        }else{
            callback(false);
        }
    }else{
        callback(false);
    }
}

module.exports.getUserId = function(token){
    token = validToken(token);
    var decoded = jwt.decode(token);
    if (decoded) {
        return decoded.sub;
    }else{
        return null;
    }
}

function validToken(token){
    if (token.indexOf("Bearer")!== -1){
        token = token.slice(token.indexOf("Bearer")+7);
    }
    return token;
}

function tokenExpired(decodedToken){
    if ((Math.round(Date.now()/1000)) > decodedToken.exp){
        return true;
    }else{
        return false;
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