var fs = require("fs");
var promptly = require('promptly');
var q = require("q");
var writeConfig = require('./write-config');
module.exports = function(project){
    if (project) return writeConfig("project", project);
    var d = q.defer();
    promptly.prompt('Enter Your Project Id: ',{
        'trim': true,
        'silent': false
    },function (err, project) {
        if(err) project = undefined;
        writeConfig("project", project)
        .then(function(project){
            console.log("project set");
            d.resolve(project);
        }).fail(function(reason){
            console.log("project set failed")
            d.reject(reason);
        });
    });
    return d.promise;
}
