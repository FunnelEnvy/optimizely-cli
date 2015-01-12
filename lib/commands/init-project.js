/**
 * Module depencies
 */
var logger = require("../logger");
var OptimizelyClient = require('../client/OptimizelyClient');
var readConfig = require("../read-config");
var Project = require("../project");
var Experiment = require("../experiment");


/**
 * pull a remote project down via the api
 * optionally retrieve experiments and variations
 * and write project.json
 *
 * @param <String> id
 * @param <Program> program
 * @param <Project> project
 */
var pullRemoteProject = function(id, program) {
  var optClient;
  readConfig("token")
    .then(function(token) {
      optClient = new OptimizelyClient(token);
      return optClient.getProject(id)
        .then(function(project) {
          var theProject = new Project(project);
          return theProject.save();
        })
    })
    .catch(function (e) {
      logger.log("error", "unable to pull project: " + e.message);
      console.error(e.stack);
    });
}

var createLocalProject = function(id, program) {
  var defaultAttrs = {
    id: id,
    include_jquery: !!program.jquery,
  };
  var theProject = new Project(defaultAttrs, "./");
  return theProject.save(); 
}

/**
 * Initialize a remote, pulled or local (default) project
 *
 * @param <String> id
 * @param <Program> program
 */
module.exports = function(id, program) {
  logger.log("info", "initializing project " + id);
  if (program.remote) {
    pullRemoteProject(id, program);
  } else {
    createLocalProject(id, program);
  }
  logger.log("info", "initialized project " + id);
}
