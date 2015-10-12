var fs = require('fs');

var chai = require("chai");
var assert = chai.assert;
var quickTemp = require('quick-temp');
var proxyquire = require('proxyquire');
var sinon = require('sinon');

var utils = require('../utils');
var logger = require("../../lib/logger.js");

//verbose logging
// chai.config.includeStack = true;  
// logger.debugLevel = 'debug';

var ClientStub = function() {};
var VariationClientStub = sinon.spy();
var options = {
  'cwd': __dirname
};
var directory = {};

var pushExperiment = proxyquire('../../lib/commands/push-experiment', { 
  'optimizely-node-client': ClientStub,
  './push-variation': VariationClientStub
 });

describe('Push Experiment Command', function() {
  before(function(done) {
    //Create temporary project directory and enter it
    quickTemp.makeOrRemake(directory, 'project');
    options.cwd = directory.project;
    directory.experiment = directory.project + '/test-experiment/';

    //Initialize the project and create experiment
    utils.init(directory.project);
    utils.experiment(directory.experiment)
    utils.createOptimizelyToken(directory.project);
    process.chdir(directory.project);
    done();
  });


  after(function() {
    //Remove the temporary directory  
    quickTemp.remove(directory, 'project');
  });

  beforeEach(function() {
    ClientStub.prototype.createExperiment = utils.clientFunctionStub('1234');
    ClientStub.prototype.updateExperiment = utils.clientFunctionStub('1234');
    assert(fs.existsSync(directory.experiment), 'experiment folder not found');
  });

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
  describe("Iterate Option",function(done) {
    before(function(done) {
      var variationAFolder = 'test-variation-a/';
      var variationBFolder = 'test-variation-b/';
      directory.variation = {};
      directory.variation.a = directory.experiment + variationAFolder;
      directory.variation.b = directory.experiment + variationBFolder;
      options.multipleVariations = true;


      utils.variation(directory.experiment, variationAFolder, 'Variation A');
      utils.variation(directory.experiment, variationBFolder, 'Variation B');
      process.chdir(directory.project);
      done();
    });
    it('Should push multiple variations', function(done) {
      utils.addIdToFile(directory.variation.a + 'variation.json', '4567');
      utils.addIdToFile(directory.variation.b + 'variation.json', '4567');

      pushExperiment(directory.experiment, {iterate: true});

      setTimeout(function() {
        assert(VariationClientStub.called, "pushVariation was not called");
        done();
      }, 10);

    });
  });
});
