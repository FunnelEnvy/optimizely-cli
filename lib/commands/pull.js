var request = require('request');
var readConfig = require("../read-config");
var Experiment = require("../experiment");

function handleExperimentResponse(body, token) {
  // Read first Variation's first Action's page_id to get edit_url
  var responseJSON = JSON.parse(body);
  var experimentName = responseJSON['name'];
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
    // Create Variations
    for (let i = 0; i < responseJSON['variations'].length; i++) {
      let variationName = responseJSON['variations'][i]['name'];
      require('./create-variation')(experimentName, variationName, '');
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
      console.log(`Error reading remote Experiment: ${err}`);
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
