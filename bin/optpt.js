#!/usr/bin/env node

fs = require('fs');
var OptimizelyClient = require('../lib/OptimizelyClient');
var opener = require('opener');

var argv = require('yargs').argv;

function getOptimizelyClient() {
  var clientConfig = JSON.parse(fs.readFileSync('./secrets.json'));
  return new OptimizelyClient(clientConfig['apiToken']);
}

//read json file
var experimentConfig = JSON.parse(fs.readFileSync('./experiment.json'));

console.log(experimentConfig);
var optClient = getOptimizelyClient();

var experiment;

//check if experiment exists, if not create it
//checking by description
optClient.getExperimentByDescription(experimentConfig['project_id'], experimentConfig['description'])
  .then(function(experiment) {
    if (experiment === undefined) {
      //create a new experiment
      console.log('Experiment ' + experimentConfig.description + ' does not exist. So we will create it.');
       return optClient.createExperiment(experimentConfig);
    } else {
      console.log('Experiment ' + experimentConfig.description + ' already exists');
      return [experiment, null];
    }
  })
  .spread(function(data, results) {
    //create or update the variations
    //for the first one just update the one that's precreated
    console.log('updating the first variaton');
    firstVar = experimentConfig.variations[0];
    return optClient.updateVariation(data.variation_ids[1],
                                     {'js_component': fs.readFileSync('variations/' + firstVar['js_component_file']).toString(),
                                       'description': firstVar.description
                                     });
  })
  .error(function(e) {
      console.error("unable to continue: ", e.message);
  });
