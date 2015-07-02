//Test the init command
var fs = require('fs');

var assert = require('chai').assert;
var quickTemp = require('quick-temp');

var utils = require('../utils');
var directory = {};

describe('Init Project Command' , function () {
  before(function (done) {
    //Create the temporary project folder and enter it
    quickTemp.makeOrRemake(directory, 'project');
    //Initialize the project
    utils.init(directory.project);
    done();
  });
  after(function (done) {
    quickTemp.remove(directory, 'project');
    done();
  })
  it('Should create a project.json file', function (done) {
    fs.exists(directory.project + '/project.json', function (exists) {
      assert(exists, 'project.json does not exist');
      done();
    });
  });
})