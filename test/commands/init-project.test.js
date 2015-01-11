//Test the init project command
var fs = require('fs');

var assert = require('chai').assert;
var nexpect = require('nexpect');
var quickTemp = require('quick-temp');

var options = {
  'cwd': __dirname
};
var directory = {};

describe('Init Project Module' , function () {
  before(function (done) {
    quickTemp.makeOrRemake(directory, 'project');
    options.cwd = directory.project;
    done();
  });
  after(function (done) {
    quickTemp.remove(directory, 'project');
    done();
  })
  it('Should create a project.json file', function (done) {
    nexpect.spawn('optcli', ['init'], options)
      .run(function (err) {
        assert(!err, 'Error when running init command: ' + err);
        fs.exists(directory.project + '/project.json', function (exists) {
          assert(exists, 'project.json not found');
          done();
        });
      });
  })
})