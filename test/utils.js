/**
 * Utility functions for tests
 */
var assert = require('chai').assert;
var fs = require('fs');
var Promise = require('bluebird');

var optcli = __dirname + "/../bin/optcli.js";
var utils = {};
var initProject = require('../lib/commands/init-project.js');
var createExperiment = require('../lib/commands/create-experiment.js');
var createVariation = require('../lib/commands/create-variation.js');


var experimentName = 'Test Experiment';
var editURL = 'http://example.com'; 
var projectID = 12345;

/**
 * Initializes a project within the cwd
 * specified in the options object
 */
utils.init = function(directory, options) {
  var include_jquery;
  if(options && options.jquery) {
    include_jquery = options.jquery;
  } else {
    include_jquery = false;
  }
  var initialDir = __dirname;
  var program = {remote: false, jquery: include_jquery};
  process.chdir(directory);
  initProject(projectID, program);
  
  process.chdir(initialDir);
  return {
    directory: directory,
    id: projectID
  }
}

/**
 * Creates an experiment within the cwd
 * specified in the options object
 */
utils.experiment = function(directory, options) {
  if(!options) options = {};
  createExperiment(directory, experimentName, editURL, options);
  return {
    directory: directory,
    name: experimentName,
    editURL: editURL
  }
}

/**
 * Creates a variation within the cwd
 * specified in the options object
 */
utils.variation = function(experimentDirectory, variationFolder, variationName) {
  program = {};
  createVariation(experimentDirectory, variationFolder, variationName, program);
}

/**
 * Creates .optcli directory and token file
 */
utils.createOptimizelyToken = function(projectDir) {
  //create the .optcli and token directory 
  fs.mkdirSync(projectDir + '/.optcli/');
  fs.writeFileSync(projectDir + '/.optcli/token', '12345');
}

/**
 * adds an id attribute to a JSON file
 * */
utils.addIdToFile = function(fileName, id) {
  var fileAttrs = JSON.parse(fs.readFileSync(fileName));
  fileAttrs['id'] = id;
  return fs.writeFileSync(fileName, JSON.stringify(fileAttrs));
}

utils.clientFunctionStub = function(id) {
  return function(args) {
    return new Promise(function(resolve, reject) {
      args['id'] = id;
      resolve(args);
    })
  }
};

module.exports = utils;
