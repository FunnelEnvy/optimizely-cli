var writeExperiments = require("./write-experiments");
var fs = require("fs");
var OptimizelyClient = require('./OptimizelyClient');
module.exports = function(description, edit_url, variations, program) {
    if (program.remote) {
        return require("./read-config")("token")
            .then(function(token) {
                var optClient = new OptimizelyClient(token);
                optClient
                    .createExperimentB(
                        String(JSON.parse(fs.readFileSync(
                                "project.json"))
                            .id),
                        description,
                        edit_url,
                        ""
                    ).then(function(experiment) {
                        console.log("Ex", experiment)
                        writeExperiments([experiment])
                    }, function(error) {
                        console.log("Er", error.message)
                    })
            })
    } else {
        writeExperiments([{
            description: description,
            edit_url: edit_url
        }])
    }
}
