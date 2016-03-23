var fs = require('fs');
var chai = require('chai');
chai.config.truncateThreshold = 0; // disable truncating
var expect = chai.expect;
var path = require('path');
var slash = path.sep;
var proxyquire = require('proxyquire');
var quickTemp = require('quick-temp');
var _ = require('lodash');
var Project = require('../lib/project.js');
var Experiment = require('../lib/experiment.js');
var Variation = require('../lib/variation.js');
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

var experiment;
var folder = slash + 'new-experiment';
var description = 'My new experiment';
var edit_url = 'http://www.example.com';
var project_id = 154321;
var directories = {};
var experimentData = {
  description : description,
  edit_url : edit_url
};
quickTemp.makeOrRemake(directories, 'project');
var experimentPath = directories.project + folder;

describe('Experiment Object', function (){

  before(function(done){
    experiment = Experiment.create({
      description: description,
      edit_url: edit_url
    }, experimentPath);
    fs.writeFile(directories.project + slash + 'project.json', '{"id":"'+project_id+'","include_jquery":"false","project_name":"my project"}', function(err){
      if(!err){
        done()
      } else {
        done(err)
      }
    });
  });

  after(function(done){
    quickTemp.remove(directories, 'project');
    done();
  });

  describe('#create()', function() {
    it('Should create an experiment directory', function (done){
      fs.exists(experimentPath, function(exists){
        expect(exists).to.be.true;
      });
      done();
    });
    it('Should create a global.css file', function(done){
      fs.exists(experimentPath + slash + 'global.css', function(exists){
        expect(exists).to.be.true;
        done();
      })
    });
    it('Should create a global.js file', function(done){
      fs.exists(experimentPath + slash + 'global.js', function(exists){
        expect(exists).to.be.true;
        done();
      })
    });
    it('Should create an experiment.json file', function(done){
      fs.readFile(experimentPath + slash + 'experiment.json', function(err, data){
        expect(err).to.be.null;
        expect(JSON.parse(data)).to.deep.equal({
          'description': description, 
          'edit_url': edit_url
        });
        done();
      });
    });
    it('Should return an experiment object', function(){
      expect(experiment).to.be.an.instanceOf(Experiment);
    });
  });

  describe('#locateAndLoad()', function(){
    var experiment;
    before(function(done){
      experiment = Experiment.locateAndLoad(experimentPath);
      done();
    });
    after(function(done){
      done();
    })
    it('Should locate the experiment.json', function(){
      expect(experiment).to.be.an.instanceOf(Experiment);
    });
    it('Should load the experiment.json', function(){
      expect(experiment.attributes).to.deep.equal(experimentData);
    });
  });

  describe('#getJSPath()', function(){
    it('Should return the JS Path', function(){
      var experiment = Experiment.locateAndLoad(experimentPath);
      expect(experiment.getJSPath()).to.equal(experimentPath + slash + 'global.js');
    })
  });

  describe('#getCSSPath()', function(){
    it('Should return the CSS Path', function(){
      var experiment = Experiment.locateAndLoad(experimentPath);
      expect(experiment.getCSSPath()).to.equal(experimentPath + slash + 'global.css');
    })
  });

  describe('#getCSS()',function(){
    it('Should return global.css contents', function(done){
      var mockCSS = '.my-class {background: white;}';
      fs.writeFile(experimentPath + slash + 'global.css', mockCSS, function(err, data){
        var experiment = Experiment.locateAndLoad(experimentPath);
        expect(experiment.getCSS()).to.equal(mockCSS);
        done();
      });
    });
  });

  describe('#getJS()', function(){
    it('Should return global.js contents', function(done){
      var mockJS = '$(\'body\').addClass(\'my-class\');';
      fs.writeFile(experimentPath + slash + 'global.js', mockJS, function(err, data){
        expect(err).to.be.null;
        var experiment = Experiment.locateAndLoad(experimentPath);
        expect(experiment.getJS()).to.equal(mockJS);
        done();
      });
    });
  });

  describe('#getVariations()', function(){
    before(function(done){
      variationOne = experimentPath + slash + 'variation1';
      variationTwo = experimentPath + slash + 'variation2';
      Variation.create({
        description: description,
      }, variationOne);
      Variation.create({
        description: description,
      }, variationTwo);
      done();
    })
    it('Should return an array with location of variations', function(){
      var experiment = Experiment.locateAndLoad(experimentPath);
      // Convert Windows slashes to Unix slashes for comparison
      var var1Path = (variationOne + slash + 'variation.json').replace(/\\/g, '/');
      var var2Path = (variationTwo + slash + 'variation.json').replace(/\\/g, '/');
      expect(experiment.getVariations()).to.deep.equal([var1Path, var2Path]);
    })
  });

  describe('#createRemote()', function(){
    it('Should create a remote experiment', function(){

      functionCalls = [];
      var experiment = Experiment.locateAndLoad(experimentPath);
      var client = {
        createExperiment: recordFunctionCalls('updateExperiment', 
          {then: recordFunctionCalls('then', 
            {
              catch: recordFunctionCalls('catch')
            })
          })
      }
      var expArgs = _.clone(experiment.attributes);
      expArgs['custom_css'] = experiment.getCSS();
      expArgs['custom_js'] = experiment.getJS();
      expArgs['project_id'] = String(project_id);

      experiment.createRemote(client);
      expect(functionCalls[0]).to.have.a.property('functionName', 'updateExperiment');
      expect(functionCalls[0][0]).to.deep.equal(expArgs);
    });
  });
  describe('#updateRemote()', function(){
    it('Should update a remote experiment', function(){
      functionCalls = [];
      var experiment = Experiment.locateAndLoad(experimentPath);
      var client = {
        updateExperiment: recordFunctionCalls('updateExperiment', 
          {then: recordFunctionCalls('then', 
            {
              catch: recordFunctionCalls('catch')
            })
          })
      };
      var expArgs = _.clone(experiment.attributes);
      expArgs['custom_css'] = experiment.getCSS();
      expArgs['custom_js'] = experiment.getJS();

      experiment.updateRemote(client);
      expect(functionCalls[0]).to.have.a.property('functionName', 'updateExperiment');
      expect(functionCalls[0][0]).to.deep.equal(expArgs);
    });
  });
  
  describe('#getOptcliURL()', function(){
    it('Should put optcli=activate at the end with an &', function(){
      var newURL = edit_url + '?myparam=true';
      var experiment = new Experiment({
        description: description,
        edit_url: newURL
      }, experimentPath+'1');
      expect(experiment.getOptcliURL()).to.equal(newURL+'&optcli=activate');
    });
    it('Should put optcli=activate at the end with a ?', function(){
      var newURL = edit_url;
      var experiment = new Experiment({
        description: description,
        edit_url: newURL
      }, experimentPath+'1');
      expect(experiment.getOptcliURL()).to.equal(newURL+'?optcli=activate');
    });
    it('Should put optcli=activate before the hash with an &', function(){
      var newURL = edit_url + '?mygetparam=true#myhashparam=true';
      var experiment = new Experiment({
        description: description,
        edit_url: newURL
      }, experimentPath+'1');
      expect(experiment.getOptcliURL()).to.equal(newURL.replace('#','&optcli=activate#'));
    });
    it('Should put optcli=activate before the hash with a ?', function(){
      var newURL = edit_url + '#myhashparam=true';
      var experiment = new Experiment({
        description: description,
        edit_url: newURL
      }, experimentPath+'1');
      expect(experiment.getOptcliURL()).to.equal(newURL.replace('#','?optcli=activate#'));
    });
  });
});