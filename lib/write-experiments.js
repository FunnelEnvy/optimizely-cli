var fs = require('fs');
var hat = require('hat');
var writeText = require("./write-text");
var writeJSON = require("./write-json");
var writeDir = require("./write-dir");
module.exports = function(experiments, writeVars) {
    experiments.forEach(function(experiment) {
        experiment.description =
            experiment.description || hat();
        writeDir(experiment.description);
        writeText(
            experiment.description +
            "/" + "custom.css", experiment.custom_css);
        writeText(
            experiment.description +
            "/" + "custom.js", experiment.custom_js);
        writeJSON(
            experiment.description +
            "/" + "experiment.json", experiment);
        delete experiment.custom_css;
        delete experiment.custom_js;
        if (writeVars) {
            require("./write-variations")(experiment);
        }
    })
}
