var fs = require('fs');
var quickTemp = require('quick-temp');
var Project = require('../lib/project.js');
var utils = require('./utils.js');
var chai = require('chai');
var expect = chai.expect;

var directory = {};
var projectDetails = {};

describe('Project Object', function(){
  describe('#createFromFile()',function(){
    before(function (done){
      //Create temporary project directory 
      quickTemp.makeOrRemake(directory, 'project');
      projectDetails = utils.init(directory.project);
      done();
    });
    after(function (done) {
      //Remove the temporary directory
      quickTemp.remove(directory, 'project');
      done();
    });
    it('Should return a project loaded from a file',function(done){
      var currentDir = process.cwd();
      var project;
      process.chdir(directory.project);
      project = Project.createFromFile();
      expect(project).to.be.an.instanceOf(Project);
      expect(project.attributes).to.have.property('id', projectDetails.id);
      process.chdir(currentDir);
      done();
    });
  });
  describe('#save()',function(){
    before(function (done){
      //Create temporary project directory 
      quickTemp.makeOrRemake(directory, 'project');
      done();
    });
    after(function (done) {
      //Remove the temporary directory
      quickTemp.remove(directory, 'project');
      done();
    });
    it('Should create a project.json', function(done){
      var currentDir = process.cwd();
      var projectDetails = {id: '1234', include_jquery: 'true'};
      var project;
      
      process.chdir(directory.project);
      project = new Project(projectDetails, directory.project);
      project.save();
      fs.readFile(directory.project + '/project.json', function(err, file){
        expect(JSON.parse(file)).to.deep.equal(projectDetails);
        process.chdir(currentDir);
        done();
      });
    });
  });
});