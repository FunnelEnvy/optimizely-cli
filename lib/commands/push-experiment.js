var _ = require("lodash");

var readConfig = require("../read-config");
var Experiment = require("../experiment");
var logger = require("../logger");
var OptimizelyClient = require('optimizely-node-client');

module.exports = function(folder, program) {
  //find the experiment
  var experiment = Experiment.locateAndLoad(folder);

  if (!experiment) {
    logger.log("error", "could not find experiment at " + folder);
    return;
  } else {
    logger.log("info", "pushing experiment at " + folder);
  }

  readConfig("token").then(function(token) {
      client = new OptimizelyClient(token);

      //if we already have an id, then update
      if (experiment.attributes.id) {

        experiment.updateRemote(client);
      } else {
        experiment.createRemote(client);
      }
    }).catch(function(error) {
      // Handle any error from all above steps
      logger.log("error", error.stack);
    })
    .done();
}
