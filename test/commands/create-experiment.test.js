//Test the create experiment command
var fs = require('fs');

var assert = require('chai').assert;
var nexpect = require('nexpect');
var quickTemp = require('quick-temp');
var options = {
	'cwd': __dirname
};
var directory = {};

describe('Create Experiment Module', function () {
  before(function () {
    quickTemp.makeOrRemake(directory, 'project');
    options.cwd = directory.project;
    nexpect.spawn('optcli', ['init'], options)
      .run(function (err) {
        assert(!err, 'Error when initializing a project');
      });
  });
  after(function () {
    quickTemp.remove(directory, 'project');
  })
  it('Should create an experiment folder with experiment.json, global.js, and global.css' , function (done) {
    nexpect.spawn('optcli', ['experiment', 'test-experiment', '"Test Experiment"', 'http://example.com'], options)
      .run(function (err) {
        assert(!err, 'Errror when creating experiment');
        directory.experiment = directory.project + '/test-experiment/';
        fs.exists(directory.experiment + 'experiment.json', function (exists) {
          assert(exists, 'experiment.json not found');
          fs.exists(directory.experiment + 'global.js', function (exists) {
            assert(exists, 'global.js not found');
            fs.exists(directory.experiment + 'global.css', function (exists) {
              assert(exists, 'global.css not found');
              done();
            });
          });
        });
      });
  });
})





