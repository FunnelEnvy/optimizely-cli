var fs = require("fs");
var promptly = require('promptly');
var q = require("q");
var writeConfig = require('./write-config');
module.exports = function(token){
    if (token) return writeConfig("token", token);
    var d = q.defer();
    promptly.prompt('Enter Your Optimizely Token (hidden): ',{
        'trim': true,
        'silent': true
    },function (err, token) {
        if(err) token = undefined;
        writeConfig("token", token)
        .then(function(token){
            console.log("token set");
            d.resolve(token);
        }).fail(function(reason){
            console.log("token set failed")
            d.reject(reason);
        });
    });
    return d.promise;
}
