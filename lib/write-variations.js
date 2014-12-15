module.exports = function(experiment) {
    require("./read-config")("token").then(function(token) {
        var optClient = new(require('./OptimizelyClient'))(token);
        experiment
            .variation_ids.forEach(function(id) {
                optClient.getVariationB(id)
                    .then(function(variation) {
                        require("./save-variation")(
                            experiment, variation);
                    })
            });
    })
}
