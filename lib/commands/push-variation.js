var path = require("path");

var readConfig = require("../read-config");
var Variation = require("../variation");
var Experiment = require("../experiment");
var logger = require("../logger");
var OptimizelyClient = require('optimizely-node-client');

module.exports = function(folder) {
  //find the variation
  var varPath = path.resolve(process.cwd(), folder);
  var variation = new Variation({}, varPath);
  variation.loadFromFile();

  if (!variation) {
    logger.log("error", "could not find variation at " + folder);
    return;
  }
  logger.log("info", "pushing variation at " + folder);
  readConfig("token").then(function(token) {
      var client = new OptimizelyClient(token);
      //if we already have an id, then update
      if (variation.attributes.id) {
        variation.updateRemote(client);
      } else {
        //find the experiment
        this.experiment = new Experiment({}, path.normalize(variation.baseDir +
          "/.."));
        if(!this.experiment.loadFromFile()){
          logger.log("error", "no experiment.json found.");
          return;
        } else if (!this.experiment.attributes.id) {
          logger.log("error",
            "no id found for experiment. Please run push-experiment first"
          );
          return;
        }
        variation.createRemote(client, this.experiment);
      }
    }).catch(function(error) {
      // Handle any error from all above steps
      logger.log("error", error.stack);
    })
    .done();
};
