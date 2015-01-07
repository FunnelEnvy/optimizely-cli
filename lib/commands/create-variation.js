var fs = require("fs");
var hat = require("hat");
var path = require("path");

var OptimizelyClient = require('../client/OptimizelyClient');
var readConfig = require("../read-config");
var Experiment = require("../experiment");
var Variation = require("../variation");
var logger = require("../logger");

// var createRemoteVariation = function(experiment, description) {
//   readConfig("token").then(function(token) {
//     var optClient = new OptimizelyClient(token);
//     optClient
//       .createVariationB(experiment.attributes.id, //TODO: fix this
//         description)
//       .then(function(variation) {
//         var theVariation = new Variation(variation);
//         theVariation.experiment = experiment;
//         theVariation.save();
//       }, function(error) {
//         logger.log("error", error);
//       })
//       .catch(function (e) {
//         logger.log("error", "unable to create remote variation: " + e.message);
//         console.error(e.stack);
//       });
//   })
// }

var createLocalVariation = function(experiment, folder, description) {
  var success = Variation.create({
    description: description,
  }, path.join(experiment.baseDir, folder));
  if (success) {
    logger.log("info", "created variation " + description + "in folder " + folder);
  } else {
    logger.log("error", "failed to create variation");
  }
}

module.exports = function(identifier, folder, description, program) {
  var experiment = Experiment.locateAndLoad(identifier);
  if (experiment) {
    createLocalVariation(experiment, folder, description);
  } else {
    console.log("no local experiment found by: " + identifier + ". Please specify experiment folder, id or description")
  }

}
