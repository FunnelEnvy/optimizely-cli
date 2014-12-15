var OptimizelyClient = require('./OptimizelyClient');
var readConfig = require("./read-config");
var saveVariation = require("./save-variation");
var writeJSON = require("./write-json");
var writeDir = require("./write-dir");

var fs = require("fs");
var glob = require("glob");
var hat = require("hat");
module.exports = function(id, description, program) {
    var location;
    var experiment;
    glob.sync("**/experiment.json").forEach(function(file) {
        if (experiment) return;
        var ex = JSON.parse(fs.readFileSync(file, {
            encoding: "utf-8"
        }));
        if (String(ex.id) !== id && ex.description !==
            id) return;
        location = file;
        experiment = ex;
    })
    if (experiment) {
        if (program.remote) { //Create variation remotely
            require("./read-config")("token").then(function(token) {
                var optClient = new OptimizelyClient(token);
                optClient
                    .createVariationB(experiment.id,
                        description)
                    .then(function(variation) {
                        experiment.variation_ids = experiment.variation_ids || [];
                        experiment.variation_ids.push(variation
                            .id);
                        writeDir(experiment.description + "/" +
                            variation.description)
                        writeJSON(location, experiment);
                        require("./write-variations")({
                            description: experiment.description,
                            id: experiment.id,
                            variation_ids: [variation.id]
                        });
                    }, function(e) {
                        console.log(e)
                    })

            })
        } else { //create variation locally;
            var variation = {
                id: hat(),
                description: description,
                _local: true
            }
            experiment.variation_ids = experiment.variation_ids || [];

            experiment.variation_ids.push(variation.id);
            writeDir(experiment.description + "/" + variation.description);
            writeJSON(location, experiment);
            saveVariation(experiment, variation);
        }
    } else {
        console.log("no local experiment found")
    }

}
