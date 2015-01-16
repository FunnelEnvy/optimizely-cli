//Test the variation command
var fs = require('fs');

var assert = require('chai').assert;
var nexpect = require('nexpect');
var quickTemp = require('quick-temp');

var utils = require('../utils.js');
var options = {
  'cwd': __dirname
};
var directory = {};

describe('Create Variation Module', function () {
  before(function (done) {

    //Create temporary project directory
    quickTemp.makeOrRemake(directory, 'project');
    options.cwd = directory.project;
    directory.variation = directory.project + '/test-experiment/test-variation';
    
    //Initialize a project, create experiment, and create a variation
    utils.init(options, utils.experiment, [options, utils.variation, [options,done]]);
  });
  after(function () {
    //Remove the project directory
    quickTemp.remove(directory, 'project');
  });
  it('Should create a variation folder within the experiment folder', function (done) {
    fs.exists(directory.variation, function (exists) {
      assert(exists, 'Variation folder does not exist');
      done();
    });
  })
  it('Should create variation.json within the variation folder', function (done) {
    fs.exists(directory.variation + '/variation.json', function (exists) {
      assert(exists, 'variation.json not found');
      done();
    });
  });
  it('Should create variation.js within the variation folder', function (done) {
    fs.exists(directory.variation + '/variation.js', function (exists) {
      assert(exists, 'variation.js not found');
      done();
    });
  })
});