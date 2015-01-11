//Test the create variation command
var fs = require('fs');

var assert = require('chai').assert;
var nexpect = require('nexpect');
var quickTemp = require('quick-temp');
var options = {
  'cwd': __dirname
};
var directory = {};

describe('Create Variation Module', function () {
  before(function (done) {
    quickTemp.makeOrRemake(directory, 'project');
    options.cwd = directory.project;
    nexpect.spawn('optcli', ['init'], options)
      .run(function (err) {
        assert(!err, 'Error while initializing a project: ' + err);
        nexpect.spawn('optcli', ['experiment', 'test-experiment', '"Test Experiment"', 'http://example.com'], options)
          .run(function (err) {
            assert(!err, 'Error while creating experiment: ' + err);
            done();
          });
      });
  });
  after(function () {
    quickTemp.remove(directory, 'project');
  });
  it('Should create a variation within the experiment folder with a variation.js and variation.json', function (done) {
    nexpect.spawn('optcli', ['variation', 'test-experiment', 'test-variation', '"Test Variation"'], options)
      .run(function (err) {
        assert(!err, 'Error when creating variation');
        directory.variation = directory.project + '/test-experiment/test-variation';
        fs.exists(directory.variation + '/variation.json', function (exists) {
          console.log(directory.variation);
          assert(exists, 'variation.json not found');
          fs.exists(directory.variation + '/variation.js', function (exists) {
            assert(exists, 'variation.js not found');
            done();
          });
        });
      });
  });
});