var OptimizelyClient = require('./OptimizelyClient');
var readConfig = require("./read-config");
var getExperiments = require("./get-experiments");
var q = require("q");
module.exports = function(fullfillment){
    var getVariations = function(experiments){
        return readConfig("token").then(function(token){
            var k = 0;
            var ds = {};
            experiments.forEach(function(experiment, i){
                experiment
                .variation_ids
                .forEach(function(id){
                    ds[id] = q.defer();
                });
                experiment
                .variation_ids
                .forEach(function(id, index, other){
                    (new OptimizelyClient(token))
                    .getVariation(id)
                    .then(function(variation){
                        ds[variation[0].id].resolve(variation[0]);
                    })
                })
            });
            var d2s = [];
            for(i in ds) d2s.push(ds[i].promise);
            return q.all(d2s)
            .then(fullfillment);
        })
    }
    return getExperiments(getVariations);
}
