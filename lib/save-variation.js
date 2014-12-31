var fs = require('fs');
var writeText = require('./write-text');
var writeJSON = require('./write-json');
var writeDir = require('./write-dir');
module.exports = function(experiment, variation) {
        variation.description =
            variation.description ||
            require("hat")();
        writeDir(experiment.description +
            "/" +
            variation.description);
        writeText(
            experiment.description +
            "/" +
            variation.description +
            "/" +
            "variation.js",
            variation.js_component
        );
        writeJSON(
            experiment.description +
            "/" +
            variation.description +
            "/" +
            "variation.json",
            variation);
    },
    function(error) {
        console.log(error)
    }
