var util = require('util');
var _ = require('lodash');

var fileUtil = require("./file-util");
var OptCLIBase = require("./optcli-base");


function Project(attributes, baseDir) {
  Project.super_.call(this, attributes, baseDir);
}

Project.JSON_FILE_NAME = "project.json";

util.inherits(Project, OptCLIBase);

Project.createFromFile = function() {
  var project = new Project({}, "./");
  if(!project.loadFromFile()) return false;
  return project;
  
}

Project.prototype.save = function() {
  var attrsToSave = _.pick(this.attributes, ['id', 'project_name', 'include_jquery']);

  fileUtil.writeJSON(Project.JSON_FILE_NAME, attrsToSave);
}

module.exports = Project;
