/**
 * Utility functions for tests
 */
var nexpect = require('nexpect');
var assert = require('chai').assert;

var optcli = __dirname + "/../bin/optcli.js";
var utils = {};


/**
 * Initializes a project within the cwd
 * specified in the options object
 */
utils.init = function(options, done, args) {
  args = args || [];
  nexpect.spawn(optcli, ['init'], options)
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
  nexpect.spawn(optcli, ['variation', 'test-experiment', 'test-variation',
      '"Test Variation"'
    ], options)
    .run(function(err) {
      assert(!err, 'Error when creating variation');
      done.apply(this, args);
    });
}



/**
 * Pushes an experiment within the cwd
 * specified in the options object
 */
utils.pushExperiment = function(options, done, args) {
  args = args || [];
  nexpect.spawn(optcli, ['push-experiment', 'test-experiment'], options)
    .expect("")
    .run(function(err) {
      assert(!err, 'Error while pushing experiment');
      done.apply(this, args);
    });
}

/**
 * Creates a variation within the cwd
 * specified in the options object
 */
utils.pushVariation = function(options, done, args) {
  args = args || [];
  nexpect.spawn(optcli, ['push-variation', 'test-experiment/test-variation'],
      options)
    .run(function(err) {
      assert(!err, 'Error when pushing variation');
      done.apply(this, args);
    });
}

module.exports = utils;
