var fs = require('fs');
var expect = require('chai').expect;
var proxyquire = require('proxyquire');
var quickTemp = require('quick-temp');
var functionCalls = [];

/**
 * Used to push any function calls and their 
 * arguments to the funcitonCalls array. We 
 * can use this function to replace any 
 * function calls that we aren't trying to 
 * test. 
 * @param  {String}   functionName    name of the function being called
 * @param  {Object}   [returnObject]  object to return after recording the funciton call
 * @return {Function}                 function that when called will record functionName and it's arguments
 */
var recordFunctionCalls = function(functionName, returnObject){
  return function(){
    var callRecorder = {functionName : functionName};
    for(var i = 0; i < arguments.length; i++){
      callRecorder[i] = arguments[i];
    }
    functionCalls.push(callRecorder);
    return returnObject;
  };
};

var directories, experimentData, ExperimentTwo, experiment;
var folder = 'new-experiment';
var description = 'My new experiment';
var edit_url = 'http://www.example.com';

var createExperimentWithDefaults = function(){
  directories = {}
  quickTemp.makeOrRemake(directories, 'experiment');
  experimentData = {
    description : description,
    edit_url : edit_url
  };
  ExperimentTwo = require('../lib/experiment.js');
  ExperimentTwo.create(experimentData, directories.experiment);
};


describe('Experiment', function (){
  
  describe('#create()', function() {
    var Experiment;
    before(function (done) {
      var fileUtil = {
        writeDir: recordFunctionCalls('writeDir'),
        writeText: recordFunctionCalls('writeText'),
        writeJSON: recordFunctionCalls('writeJSON')
      };
      var optcliBase = require('../lib/optcli-base.js');
      optcliBase.prototype
      Experiment = proxyquire('../lib/experiment.js', {
        './file-util' : fileUtil
      });
      functionCalls = [];
      experiment = Experiment.create({
        description: description,
        edit_url: edit_url
      }, folder);
      done();
    });
    after(function(){
      console.log(functionCalls.length);
    })
    it('Should create an experiment directory', function (){
      expect(functionCalls[0]).to.deep.equal({'functionName':'writeDir',0: folder});
    });
    it('Should create a global.css file', function(){
      expect(functionCalls[1]).to.deep.equal({'functionName':'writeText', 0: folder + '/global.css'});
    });
    it('Should create a global.js file', function(){
      expect(functionCalls[2]).to.deep.equal({'functionName':'writeText', 0: folder + '/global.js'});
    });
    it('Should create an experiment.json file', function(){
      expect(functionCalls[3]).to.deep.equal({
        'functionName':'writeJSON', 
        0: folder + '/experiment.json', 
        1: {
          'description': description, 
          'edit_url': edit_url
        }
      });
    });
    it('Should return an experiment object', function(){
      expect(experiment).to.be.an.instanceOf(Experiment);
    });
  });
  describe('#locateAndLoad()', function(){
    before(function(done){
      createExperimentWithDefaults();
      console.log(functionCalls.length);
      experiment = ExperimentTwo.locateAndLoad(directories.experiment);
      done();
    });
    after(function(done){
      quickTemp.remove(directories, 'experiment');
      done();
    })
    it('Should locate the experiment.json', function(){
      //expect(experiment).to.be.an.instanceOf(Experiment);
    });
    it('Should load the experiment.json', function(){
      //expect(experiment.attributes).to.deep.equal(experimentData);
    });
  });
  describe('#getCSS',function(){})
});