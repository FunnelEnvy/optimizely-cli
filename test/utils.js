/**
 * Utility functions for tests
 */
var nexpect = require('nexpect');
var assert = require('chai').assert;
var fs = require('fs');
var Promise = require('bluebird');

var optcli = __dirname + "/../bin/optcli.js";
var utils = {};


/**
 * Initializes a project within the cwd
 * specified in the options object
 */
utils.init = function(options, done, args) {
  args = args || [];
  nexpect.spawn(optcli, ['init', 'projectId'], options)
    .run(function(err) {
      assert(!err, 'Error while initializing a project');
      done.apply(this, args)
    });
}

/**
 * Creates an experiment within the cwd
 * specified in the options object
 */
utils.experiment = function(options, done, args) {
  args = args || [];
  nexpect.spawn(optcli, ['experiment', 'test-experiment', '"Test Experiment"',
      'http://example.com'
    ], options)
    .run(function(err) {
      assert(!err, 'Error while creating experiment');
      done.apply(this, args);
    });
}

/**
 * Creates a variation within the cwd
 * specified in the options object
 */
utils.variation = function(options, done, args) {
  args = args || [];

  if(options.multipleVariations){

    nexpect.spawn(optcli, ['variation', 'test-experiment', 'test-variation-a',
        '"Test Variation A"'
      ], options)
      .run(function(err) {
        assert(!err, 'Error when creating first variation ' + err);
        nexpect.spawn(optcli, ['variation', 'test-experiment', 'test-variation-b',
          '"Test Variation B"'
        ], options)
        .run(function(err) {
          assert(!err, 'Error when creating second variation ' + err);
          done.apply(this, args);
        });
      });
    
  } else {
    nexpect.spawn(optcli, ['variation', 'test-experiment', 'test-variation',
        '"Test Variation"'
      ], options)
      .run(function(err) {
        assert(!err, 'Error when creating variation ' + err);
        done.apply(this, args);
      });
  }
  
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
