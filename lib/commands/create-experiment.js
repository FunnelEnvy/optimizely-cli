/**
 * Module dependencies
 */
var OptimizelyClient = require('../client/OptimizelyClient');
var Project = require("../project");
var Experiment = require("../experiment");
var readToken = require("../read-config");
var logger = require("../logger");

/**
 * Create remote as well as local experiment
 *
 * @param <String> description the experiment description
 * @param <String> edit_url the editor url
 */
// var createRemoteExperiment = function(description, edit_url) {
//   var project = new Project();
//   project.loadFromFile();
//   return readToken("token")
//   .then(function(token) {
//     var optClient = new OptimizelyClient(token);
//     optClient
//     .createExperimentB( //TODO: fix this
//       String(project.attributes.id),
//         description,
//         edit_url,
//         ""
//     ).then(function(experiment) {
//       var theExperiment = new Experiment(experiment);
//       theExperiment.save();
//     })
//     .catch(function (e) {
//       logger.log("error", "unable to create remote experiment: " + e.message);
//       console.error(e.stack);
//     });
//   })
// }

/**
 * Create local experiment only
 *
 * @param <String> description the experiment description
 * @param <String> edit_url experiment editor url
 */
var createLocalExperiment = function(folder, description, edit_url) {
  var success = Experiment.create({
    description: description,
    edit_url: edit_url
  }, folder);
  if (success) {
    logger.log("info", "created experiment \"" + description + "\" in folder " + folder);
  } else {
    logger.log("error", "failed to create experiment");
  }
}

/**
 * The export. Create a remote or local experiment
 *
 * @param <String> description the experiment descrition
 * @param <String> edit_url experiment editor url
 * @param <Program> program caommander program object
 */
module.exports = function(folder, description, edit_url, program) {
  createLocalExperiment(folder, description, edit_url);
}
