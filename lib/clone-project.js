var OptimizelyClient = require('./OptimizelyClient');
var readConfig = require("./read-config");
var fs = require("fs");
var q = require("q");

module.exports = function() {
    var client;
    readConfig("token")
        .then(function(token) {
            return readConfig("project")
                .then(
                    function(id) {
                        client = new OptimizelyClient(token);
                        return client.getExperiments(id);
                    }
                )
                .then(function(experiments) {
                    experiments[0]
                    .map(function(experiment) {
                        var experiment_id = String(experiment.id);
                        var ds = [];
                        experiment
                            .variation_ids
                            .forEach(function() {
                                ds.push(q.defer())
                            });
                        var table = new Table({
                            head: ['Id'],
                            colWidths: [25]
                        });
                        experiment
                            .variation_ids
                            .map(function(id, index) {
                                client
                                    .getVariation(id)
                                    .then(function(variation) {
                                        ds[index].resolve(variation[0])
                                    })
                            })
                        q.all(ds)
                            .then(function(vs) {
                                var experiment_id = String(experiment.id)
                                fs.mkdirSync(experiment_id);
                                fs.writeFileSync(
                                    experiment_id + "/" + "custom_css.css",
                                    experiment.custom_css);
                                fs.writeFileSync(
                                    experiment_id + "/" + "custom_js.js",
                                    experiment.custom_js);
                                fs.writeFileSync(
                                    experiment_id + "/" + "experiment.json",
                                    JSON.stringify({
                                        activation_mode:
                                        experiment.activation_mod,
                                        description:
                                        experiment.description,
                                        edit_url:
                                        experiment.edit_url,
                                        status:
                                        experiment.status,
                                        percentage_included:
                                        experiment.percentage_included,
                                        url_conditions:
                                        experiment.url_conditions
                                    })
                                );
                                experiment
                                    .variation_ids
                                    .map(function(id) {
                                        client
                                            .getVariation(id)
                                            .then(function(variation) {

                                                fs.mkdirSync(
                                                    experiment.id + "/" + variation.id);
                                                fs.writeFileSync(
                                                    experiment.id + "/" + variation.id +
                                                    "/js_component.js",
                                                    variation.js_component
                                                )


                                                fs.mkdirSync(experiment.id + "/" + variation.id);
                                                fs.writeFileSync(
                                                    experiment.id + "/" + variation.id + "/js_component.js", variation.js_component)
                                            })

                                    });

                            });


                    });

                });
        })
        .fail(function(error) {
            console.log(error)
        })
}
