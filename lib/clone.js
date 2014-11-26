var fs = require('fs');
var getVariations = require("./get-variations");
var getExperiments = require("./get-experiments");
var cloneExperiment = require("./clone-experiment");
var cloneVariation = require("./clone-variation");
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
    getExperiments(Experiments)
    .then(function(){
        getVariations(Variations)
    });
}
