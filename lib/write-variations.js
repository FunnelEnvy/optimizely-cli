var fs = require('fs');
var writeText = require('./write-text');
var writeJSON = require('./write-json');
var writeDir = require('./write-dir');
module.exports = function(experiment) {
    require("./read-config")("token").then(function(token) {
        var optClient = new(require('./OptimizelyClient'))(token);
        experiment
            .variation_ids.forEach(function(id) {
                optClient.getVariationB(id)
                    .then(function(variation) {
                        variation.description =
                            variation.description ||
                            hat();
                        writeDir(experiment.description +
                            "/" +
                            variation.description)
                        writeText(
                            experiment.description +
                            "/" +
                            variation.description +
                            "/" +
                            "custom.js",
                            variation.js_component
                        );
                        writeJSON(
                            experiment.description +
                            "/" +
                            variation.description +
                            "/" +
                            "variation.json",
                            variation);
                    }, function(error) {
                        console.log(error)
                    })
            });
    })
}
