var OptimizelyClient = require('./OptimizelyClient');
var readConfig = require("./read-config");
var cloneExperiment = require("./clone-experiment");
var fs = require("fs");
module.exports = function(description, edit_url, url_conditions){
    var project;
    return readConfig("project").then(function(id){
        project = id;
        return readConfig("token")
        .then(function(token){
            return (new OptimizelyClient(token))
            .createExperimentB(
                project,
                edit_url,
                description,
                url_conditions
            ).then(function(experiment){
                cloneExperiment(experiment)
            })
        })
    }).then(function(result){
        console.log(result);
    }).fail(function(reason){
        console.log(reason)
    })
}
