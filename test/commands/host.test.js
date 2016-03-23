var ChildProcess = require('child_process');
var http = require('http');
var Promise = require('bluebird');
var fs = require('fs');
Promise.promisifyAll(fs);
var quickTemp = require('quick-temp');
var expect = require('chai').expect;
var spy = require('sinon').spy;

var utils = require('../utils.js');
var openSpy = spy();
var host = require('proxyquire')('../../lib/commands/host.js', {'open': openSpy});

var directory = {};
var variationJS = '$(\'body\').addClass(\'test\'); $("body").append("<%-files.test %>");';
var experimentJS = 'function myFunc(){console.log("testing is fun");}';
var fileHTML = '<div class="file-test">\n\tThis is a file test\n</div>';
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
      .then(function(){
        return fs.writeFileAsync(directory.experiment + '/test.html', fileHTML);
      })
      .then(function() {
        // Don't host until all files are created, or test.html might be empty/non-existent
        oldDir = process.cwd();
        process.chdir(directory.project);
        server = host(directory.variation, 9569 , {ssl: false, silence: true, open: true});
        done();
      })
      .catch(function(error){
        expect(error).to.be.null;
        done();
      });
  });
  after(function(done){
    process.chdir(oldDir);
    server.close();
    //Remove the temporary directory
    quickTemp.remove(directory, 'project');
    done();
  });
  it('Should host the landing page on the default port', function(done){
    http.get('http://localhost:9569/', function(res){
      expect(res.statusCode).to.equal(200);
      done();
    }).on('error', function(err) {
      console.log("Got error: " + err.message);
      done(err);
    });
  });
  
  // Store the contents of variation.js so they can be used in the next assertion.
  var resJS = '';
  it('Should host variation.js', function(done){
    http.get('http://localhost:9569/variation.js', function(res){
      expect(res.statusCode).to.equal(200);
    }).on('error', function(err){
      console.log('Got error:' + err.message);
      done();
    }).on('response', function(res) {
      res.on('readable', function() {
        resJS += res.read().toString('utf8');
      })
      // Don't call done() until resJS is completely populated.
      res.on('end', function() {
        done();
      });
      res.on('error', function(err) {
        console.log('Got error:' + err.message);
        done();
      });
    });;
  });
  it('Should compile an external file using EJS', function(done) {
    expect(resJS).to.contain('<div class=\\"file-test\\">This is a file test</div>');
    done();
  });
  it('Should host variation.css', function(done){
    http.get('http://localhost:9569/variation.css', function(res){
      expect(res.statusCode).to.equal(200);
      done();
    }).on('error', function(err){
      console.log('Got error:' + err.message);
    });
  });
  describe('Open flag', function(){
    it('Should run the open command', function(done){
      expect(openSpy.called).to.be.true;
      done();
    });
  })
  
});