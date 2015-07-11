var fs = require('fs');

var chai = require("chai");
var assert = chai.assert;
var quickTemp = require('quick-temp');
var proxyquire = require('proxyquire');
var sinon = require('sinon');

var utils = require('../utils');
var logger = require("../../lib/logger.js");

//verbose logging
chai.config.includeStack = true;
// logger.debugLevel = 'debug';

var ClientStub = function() {};
var options = {
  'cwd': __dirname
};
var directory = {};
var currentDir;
var pushVariation = proxyquire('../../lib/commands/push-variation', { 'optimizely-node-client': ClientStub });

describe('Push Variation Command', function() {
  before(function(done) {
    //Create temporary project directory and enter it
    quickTemp.makeOrRemake(directory, 'project');
    options.cwd = directory.project;
    directory.experiment = directory.project + '/test-experiment/';
    directory.variation = directory.project + '/test-experiment/test-variation/';

    //Initialize the project and create experiment
    utils.init(directory.project);
    utils.experiment(directory.experiment);
    utils.variation(directory.experiment, 'test-variation', 'test-variation');
    utils.createOptimizelyToken(directory.project);
    currentDir = process.cwd();
    process.chdir(directory.project);
    done();
  });

  after(function(done) {
    //Remove the temporary directory  
    quickTemp.remove(directory, 'project');
    process.chdir(currentDir);
    done();
  })

  beforeEach(function() {
    ClientStub.prototype.createVariation = utils.clientFunctionStub('4567');
    ClientStub.prototype.updateVariation = utils.clientFunctionStub('4567');
    assert(fs.existsSync(directory.experiment), 'experiment folder not found');
    assert(fs.existsSync(directory.variation), 'variation folder does not exist');
    utils.addIdToFile(directory.experiment + 'experiment.json', '1234');
  })

  it('Should create a remote variation', function(done) {
    sinon.spy(ClientStub.prototype, "createVariation");

    pushVariation(directory.variation, {});

    setTimeout(function() {
      assert(ClientStub.prototype.createVariation.calledOnce, "createVariation was not called");
      var variationMeta = JSON.parse(fs.readFileSync(directory.variation + 'variation.json'));
      assert(variationMeta.id == '4567', "Invalid variation id");
      done();
    }, 10);
  });

  it('Should update a remote variation', function(done) {
    sinon.spy(ClientStub.prototype, "updateVariation");
    utils.addIdToFile(directory.variation + 'variation.json', '4567');

    pushVariation(directory.variation, {});

    setTimeout(function() {
      assert(ClientStub.prototype.updateVariation.calledOnce, "updateVariation was not called");
      var variationMeta = JSON.parse(fs.readFileSync(directory.variation + 'variation.json'));
      assert(variationMeta.id == '4567', "Invalid variation id");
      done();
    }, 10);
  });

});
