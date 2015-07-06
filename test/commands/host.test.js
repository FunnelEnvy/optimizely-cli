var ChildProcess = require('child_process');
var http = require('http');
var Promise = require('bluebird');
var fs = require('fs');
Promise.promisifyAll(fs);
var quickTemp = require('quick-temp');
var assert = require('chai').assert;
var expect = require('chai').expect;
var intercept = require('intercept-stdout');

var utils = require('../utils.js');
var host = require('../../lib/commands/host.js');

var directory = {};
var variationJS = '$(\'body\').addClass(\'test\')';
var experimentJS = 'function myFunc(){console.log("testing is fun");}';
var CSS = '.test {background: blue}';
var server, browser, oldDir;

describe('Host Command', function(){
  before(function(done){
    //Create temporary project directory
    quickTemp.makeOrRemake(directory, 'project');
    directory.experiment = directory.project + '/test-experiment/';
    directory.variation = directory.project + '/test-experiment/test-variation';
    
    //Initialize a project, create experiment, and create a variation
    utils.init(directory.project);
    utils.experiment(directory.experiment);
    utils.variation(directory.experiment, '/test-variation', 'Variation 1');

    fs.writeFileAsync(directory.variation + '/variation.js', variationJS)
      .then(function(){
        return fs.writeFileAsync(directory.experiment + '/experiment.css', CSS);
      })
      .then(function(){
        return fs.writeFileAsync(directory.experiment + '/experiment.js', experimentJS);
      })
      .catch(function(error){
        assert(false, 'Could not add css/javascript to files');
      }); 
    oldDir = process.cwd();
    process.chdir(directory.project);
    server = host(directory.variation, 9569 , {ssl: false, silence: true});
    done();
  });
  after(function(done){
    process.chdir(oldDir);
    server.close(done);
  })
  it('Should host the landing page on the default port', function(done){
    http.get('http://localhost:9569/', function(res){
      expect(res.statusCode).to.equal(200);
      done();
    }).on('error', function(err) {
      console.log("Got error: " + err.message);
      done(e);
    });
  });
  it('Should host variation.js', function(done){
    http.get('http://localhost:9569/variation.js', function(res){
      expect(res.statusCode).to.equal(200);
      done();
    }).on('error', function(err){
      console.log('Got error:' + err.message);
    });
  });
  it('Should host variation.css', function(done){
    http.get('http://localhost:9569/variation.css', function(res){
      expect(res.statusCode).to.equal(200);
      done();
    }).on('error', function(err){
      console.log('Got error:' + err.message);
    });
  })
});