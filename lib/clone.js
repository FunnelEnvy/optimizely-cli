var fs = require('fs');
var getVariations = require("./get-variations");
var getExperiments = require("./get-experiments");
module.exports = function(directory){
    directory = directory || "";
    if(directory && directory[directory.length -1] !== "/"){
        directory += "/";
    }
    var Experiments = function(experiments){
        experiments.forEach(function(experiment){
            fs.mkdirSync(directory + String(experiment.id));
            fs.writeFileSync(
                directory +
                experiment.id +
                "/" +
                "custom_css.css",
                experiment.custom_css);
            fs.writeFileSync(
                directory +
                experiment.id +
                "/" +
                "custom_js.js",
                experiment.custom_js);
            fs.writeFileSync(
                directory +
                experiment.id +
                "/experiment.json",
                JSON.stringify(experiment , null, "    ")
            );
        })
    }
    var Variations = function(variations){
        variations.forEach(function(variation){
            fs.mkdirSync(
                directory +
                variation.experiment_id + "/" + variation.id);
            fs.writeFileSync(
                directory +
                    variation.experiment_id + "/" + variation.id +
                    "/js_component.js",
                    variation.js_component
                );
            delete variation.js_component;
            fs.writeFileSync(
                directory +
                variation.experiment_id + "/" + variation.id +
                "/variation.js",
                JSON.Stringify(variation, null, "    ")
            );
            console.log("cloned")
        })

    }
    getExperiments(Experiments)
    .then(function(){
        //getVariations(Variations)
    });
}
