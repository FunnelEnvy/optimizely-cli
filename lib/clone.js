var fs = require('fs');
var OptimizelyClient = require('./OptimizelyClient');
var getVariations = require("./get-variations");
var getExperiments = require("./get-experiments");
var cloneExperiment = require("./clone-experiment");
var cloneVariation = require("./clone-variation");
var readConfig = require("./read-config");
module.exports = function(directory){
    directory = directory || "";
    if(directory && directory[directory.length -1] !== "/"){
        directory += "/";
    }
    var Experiments = function(experiments){
        experiments.forEach(function(experiment){
            cloneExperiment(experiment, directory);
        })
    }
    var Variations = function(variations){
        variations.forEach(function(variation){
            cloneVariation(variation, directory);
            console.log(
                "cloned variation: ",
                variation.experiment_id +
                "/" +
                variation.id)
        })
    }
    readConfig("project").then(function(id){
        readConfig("token").then(function(token){
            (new OptimizelyClient(token)).getProject(id).then(function(project){
                var keep = ["include_jquery"];
                Object.keys(project).forEach(function(key){
                    if(keep.indexOf(key) === -1) delete project[key];
                })
                fs.writeFileSync(
                    directory +
                    "project.json",
                    project ? JSON.stringify(project, "    ") : ""
                );
                return getExperiments(Experiments)
                .then(function(){
                    getVariations(Variations)
                });
            },function(e){console.log(e)})
        })
    })
}
