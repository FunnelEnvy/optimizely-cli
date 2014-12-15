var OptimizelyClient = require('./OptimizelyClient');
var readConfig = require("./read-config");
var writeExperiments = require("./write-experiments");
var hat = require("hat");
var fs = require("fs");
var writeText = require("./write-text");
var writeJSON = require("./write-json");
var writeDir = require("./write-dir");
module.exports = function(id, program) {
    var project = {
        project_name: id,
        include_jquery: !!program.jquery,
        status: program.archive ? "Archive" : "Active"
    };
    if (program.remote) {
        var optClient;
        readConfig("token")
            .then(function(token) {
                optClient = new OptimizelyClient(token);
                optClient
                    .createProject(project.project_name, false, project
                        .include_jquery, "")
                    .then(function(project) {
                        writeJSON("project.json", project);
                    }, function(error) {
                        console.log(error)
                    })
            })
    } else if (program.pull) {
        var optClient;
        readConfig("token")
            .then(function(token) {
                optClient = new OptimizelyClient(token);
                return optClient.getProject(id)
                    .then(function(project) {
                        return writeJSON("project.json", project);
                    })
            })
            .then(function(project) {
                if (program.experiments || program.variations) {
                    return optClient
                        .getExperiments(id).then(function(experiments) {
                            writeExperiments(experiments, program.variations)
                        })
                }
            })
    } else {
        project._local = true;
        project.project_id = hat();
        writeJSON("project.json", project);
    }

}
