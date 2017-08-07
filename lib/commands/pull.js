var request = require('request');
var readConfig = require("../read-config");
var path = require("path");
var logger = require("../logger");
var Experiment = require("../experiment");
var Variation = require("../variation");

function handleExperimentResponse(body, token) {
  // Read first Variation's first Action's page_id to get edit_url
  var responseJSON = JSON.parse(body);
  var experimentName = responseJSON['name'];
  var experimentID = responseJSON['id'];
  var pageID = responseJSON['variations'][0]['actions'][0]['page_id'];
  var options = {
    url: 'https://api.optimizely.com/v2/pages/' + pageID,
    headers: {
      'Authorization': 'Bearer ' + token
    }
  }
  // Now use that edit_url to create Experiment and Variations locally
  request(options, function(err, res, newBody) {
    let editURL = JSON.parse(newBody)['edit_url'];
    // Create Experiment
    require('./create-experiment')(experimentName, '', editURL);
    // Add Experiment ID to experiment.json
    var experiment = Experiment.locateAndLoad(experimentName);
    experiment.attributes.id = experimentID;
    experiment.saveAttributes();
    // Create Variations
    for (let i = 0; i < responseJSON['variations'].length; i++) {
      let variationName = responseJSON['variations'][i]['name'];
      // TODO this will not detect multiple actions with multiple page ids
      let variationPageID = responseJSON['variations'][i]['actions'][0]['page_id'];      
      let variationWeight = responseJSON['variations'][i]['weight'];
      require('./create-variation')(experimentName, variationName, '');
      // Find the variation and add attributes
      var varPath = path.resolve(process.cwd(), experimentName, variationName);
      var variation = new Variation({}, varPath);
      variation.loadFromFile();
      if (!variation) {
        logger.log("error", "could not find variation at " + folder);
        return;
      }
      variation.attributes.name = variationName;
      variation.attributes.page_id = variationPageID;
      variation.attributes.weight = variationWeight;
      variation.saveAttributes();
    }
  });
};

function pullExperiment(experimentID, token) {
  // API call to read Experiment data
  var options = {
    url: 'https://api.optimizely.com/v2/experiments/' + experimentID,
    headers: {
      'Authorization': 'Bearer ' + token
    }
  };
  request(options, function(err, res, body) {
    if (err) {
      logger.log('error', `Error reading remote Experiment: ${err}`);
      return;
    }
    handleExperimentResponse(body, token);
  });
}

module.exports = function(experimentID) {
  // Call Optimizely X API to get Experiment data
  readConfig('token').then(function (token) {
    pullExperiment(experimentID, token);
  });
};
