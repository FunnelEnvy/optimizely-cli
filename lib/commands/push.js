var request = require('request');
var logger = require("../logger");
var readConfig = require("../read-config");
var Experiment = require("../experiment");
var Variation = require("../variation");

function pushExperiment(path, token) {
  var experiment = Experiment.locateAndLoad(path);
  var experimentID = experiment.attributes.id;
  // Build list of variation objects from local files
  var variations = [];
  experiment.getVariations().forEach(function(variationPath) {
    var variation = new Variation({}, variationPath.slice(0,- Variation.JSON_FILE_NAME.length));
    variation.loadFromFile();
    variations.push(
      {
        "name": variation.attributes.name,
        "weight": variation.attributes.weight,
        "actions": [
          {
            "changes": [
              {
                "type": "custom_code",
                "value": variation.getJS()
              },
              {
                      "type": "custom_css",
                      "value": variation.getCSS()
              }
            ],
            "page_id": variation.attributes.page_id
          }
        ]
      }
    );
  });
  // Prepare request
  var body = { "variations": variations };
  var options = {
    url: 'https://api.optimizely.com/v2/experiments/' + experimentID,
    headers: {
      'Authorization': 'Bearer ' + token
    },
    json: true,
    body: body
  }
  // Request to update remote Experiment
  request.patch(options, function(err, res, newBody) {
    if (err) {
      logger.log('error', `Error pushing experiment: ${err}`);
    } else {
      logger.log('info', `Pushed Experiment ${experimentID}`);
    }
  });
}

module.exports = function(experimentPath) {
  readConfig('token').then(function (token) {
    pushExperiment(experimentPath, token);
  });
};
