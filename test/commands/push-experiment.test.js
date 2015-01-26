var fs = require('fs');

var chai = require("chai");
var assert = chai.assert;
var nexpect = require('nexpect');
var quickTemp = require('quick-temp');
var proxyquire = require('proxyquire');
var sinon = require('sinon');

var utils = require('../utils');
var logger = require("../../lib/logger.js");

//verbose logging
// chai.config.includeStack = true;
// logger.debugLevel = 'debug';

var ClientStub = function() {};
var options = {
  'cwd': __dirname
};
var directory = {};

var pushExperiment = proxyquire('../../lib/commands/push-experiment', { 'optimizely-node-client': ClientStub });

describe('Push Experiment Module', function() {
  before(function(done) {
    //Create temporary project directory and enter it
    quickTemp.makeOrRemake(directory, 'project');
    options.cwd = directory.project;
    directory.experiment = directory.project + '/test-experiment/';

    //Initialize the project and create experiment
    utils.init(options, utils.experiment, [options, done]);
    utils.createOptimizelyToken(directory.project);
  });


  after(function() {
    //Remove the temporary directory  
    quickTemp.remove(directory, 'project');
  })

  beforeEach(function() {
    ClientStub.prototype.createExperiment = utils.clientFunctionStub('1234');
    ClientStub.prototype.updateExperiment = utils.clientFunctionStub('1234');
    assert(fs.existsSync(directory.experiment), 'experiment folder not found');
  })

  it('Should create a remote experiment', function(done) {

    //spy on the stub method
    sinon.spy(ClientStub.prototype, "createExperiment");

    //call push experiment 
    pushExperiment(directory.experiment, {});

    setTimeout(function() {
      assert(ClientStub.prototype.createExperiment.calledOnce, "createExperiment was not called");
      var experimentMeta = JSON.parse(fs.readFileSync(directory.experiment + 'experiment.json'));
      assert(experimentMeta.id === "1234", "Invalid experiment id");
      done();
    }, 10);
  });

  it('Should update a remote experiment', function(done) {
    //spy on the stub method
    sinon.spy(ClientStub.prototype, "updateExperiment");
    utils.addIdToFile(directory.experiment + 'experiment.json', '1234');

    //call push experiment 
    pushExperiment(directory.experiment, {});

    setTimeout(function() {
      assert(ClientStub.prototype.updateExperiment.calledOnce, "updateExperiment was not called");
      var experimentMeta = JSON.parse(fs.readFileSync(directory.experiment + 'experiment.json'));
      assert(experimentMeta.id === "1234", "Invalid experiment id");
      done();
    }, 10);
  });

})
