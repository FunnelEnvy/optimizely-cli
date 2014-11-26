var OptimizelyClient = require('./OptimizelyClient');
var readConfig = require("./read-config");
var cloneVariation = require("./clone-variation");
var fs = require("fs");
module.exports = function(experiment_id, description){
    var project;
    return readConfig("project").then(function(id){
        project = id;
        return readConfig("token")
        .then(function(token){
            console.log("creating: ", description)
            return (new OptimizelyClient(token))
            .createVariationB(
                experiment_id,
                description
            ).then(function(variation){
                cloneVariation(variation)
            })
        })
    })
}
