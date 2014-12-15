var fs = require('fs');
var saveVariation = require("./save-variation")
module.exports = function(experiment) {
    require("./read-config")("token").then(function(token) {
        var optClient = new(require('./OptimizelyClient'))(token);
        experiment
            .variation_ids.forEach(function(id) {
                optClient.getVariationB(id)
                    .then(function(variation) {
                        saveVariation(variation, experiment);
                    })
            });
    })
}
