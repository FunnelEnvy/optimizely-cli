//Test the experiment command
var fs = require('fs');

var assert = require('chai').assert;
var nexpect = require('nexpect');
var quickTemp = require('quick-temp');

var utils = require('../utils');

var options = {
	'cwd': __dirname
};
var directory = {};

describe('Create Experiment Module', function () {
  before(function (done) {
    //Create temporary project directory and enter it
    quickTemp.makeOrRemake(directory, 'project');
    options.cwd = directory.project;
    directory.experiment = directory.project + '/test-experiment/';

    //Initialize the project and create experiment
    utils.init(options, utils.experiment, [options, done]);
  });
  after(function () {
    //Remove the temporary directory
    quickTemp.remove(directory, 'project');
  })
  it('Should create a folder called test-experiment', function (done) {
    fs.exists(directory.experiment, function (exists) {
      assert(exists, 'experiment folder not found');
      done();
    })
  });
  it('Should create experiment.json in the experiment folder', function (done) {
    fs.exists(directory.experiment + 'experiment.json', function (exists) {
      assert(exists, 'experiment.json not found');
      done();
    });
  });
  it('Should create global.js in the experiment folder', function (done) {
    fs.exists(directory.experiment + 'global.js', function (exists) {
      assert(exists, 'global.js not found');
      done();
    });
  });
  it('Should create global.css in the experiment folder', function (done) {
    fs.exists(directory.experiment + 'global.css', function (exists) {
      assert(exists, 'global.css not found');
      done();
    });
  })
})





