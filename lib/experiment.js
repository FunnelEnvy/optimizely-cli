var hat = require('hat');
var glob = require('glob');
var fs = require('fs');
var path = require('path');
var util = require('util');
var _ = require("lodash");

var fileUtil = require("./file-util");
var logger = require("./logger");
var Variation = require("./variation");
var OptCLIBase = require("./optcli-base");
var Project = require("./project");

function Experiment(attributes, baseDir) {
  Experiment.super_.call(this, attributes, baseDir);
}

Experiment.JSON_FILE_NAME = "experiment.json";
Experiment.JS_FILE_NAME = "global.js";
Experiment.CSS_FILE_NAME = "global.css";

util.inherits(Experiment, OptCLIBase);

Experiment.create = function(attrs, baseDir) {
  //create directory
  fileUtil.writeDir(baseDir);
  fileUtil.writeText(path.join(baseDir, Experiment.CSS_FILE_NAME));
  fileUtil.writeText(path.join(baseDir, Experiment.JS_FILE_NAME));
  fileUtil.writeJSON(path.join(baseDir, Experiment.JSON_FILE_NAME), attrs);
  return new Experiment(attrs, baseDir);
}

Experiment.locateAndLoad = function(identifier) {
  var experiment = null;
  if (fs.existsSync(identifier) && fs.lstatSync(identifier).isDirectory()) {
    //it's a directory
    experiment = new Experiment({}, identifier);
    experiment.loadFromFile();
  } else {
    var attrs = {};
    glob.sync("**/" + Experiment.JSON_FILE_NAME).forEach(function(jsonFile) {
      if (experiment) return;
      try {
        var attrs = JSON.parse(fs.readFileSync(jsonFile), {encoding: "utf-8"});
        if (identifier === String(attrs.id) || identifier === attrs.description) {
          experiment = new Experiment(attrs, path.dirName(jsonFile));
          return experiment;
        }
      } catch (e) {
        logger.log("warn", "could not parse " + jsonFile);
      }
    })
  } 
  return experiment;
}

Experiment.prototype.getJSPath = function() {
  if (!this.baseDir) {
    logger.log("warn", "no base directory set");
    return null;
  }
  return path.join(this.baseDir, Experiment.JS_FILE_NAME);
}

Experiment.prototype.getCSSPath = function() {
  if (!this.baseDir) {
    logger.log("warn", "no base directory set");
    return null;
  }
  return path.join(this.baseDir, Experiment.CSS_FILE_NAME);
}

Experiment.prototype.getCSS = function() {
  return fileUtil.loadFile(this.getCSSPath()) || "";
}

Experiment.prototype.getJS = function() {
  return fileUtil.loadFile(this.getJSPath()) || "";
}

Experiment.prototype.createRemote = function(client) {
  //find the project - assume it's one directory above
  var project = new Project({}, path.normalize(this.baseDir + "/.."));
  project.loadFromFile(); 

  //create new experiment
  var expArgs = _.clone(this.attributes);
  expArgs['custom_css'] = this.getCSS();
  expArgs['custom_js'] = this.getJS();
  expArgs['project_id'] = project.attributes.id;

  var self = this;
  return client.createExperiment(expArgs).then(function(experimentAttrs) {
    //update the id
    self.attributes.id = experimentAttrs.id;
    self.saveAttributes();
    logger.log("info", "created remote experiment: " + experimentAttrs.id);
  }, function(error) {
    logger.log("error", error);
    logger.log("error", "unable to create remote experiment: " + e.message);
    console.error(e.stack);
  });
}

Experiment.prototype.updateRemote = function(client) {
  //create new experiment
  var expArgs = _.clone(this.attributes);
  expArgs['custom_css'] = this.getCSS();
  expArgs['custom_js'] = this.getJS();

  var self = this;
  return client.updateExperiment(expArgs).then(function(experimentAttrs) {
    logger.log("info", "updated remote experiment: " + experimentAttrs.id);
  }, function(error) {
    logger.log("error", error);
  }).catch(function(e) {
    logger.log("error", "unable to update remote experiment: " + e.message);
    console.error(e.stack);
  });
}

Experiment.prototype.saveAttributes = function() {
  fileUtil.writeJSON(path.join(this.baseDir, Experiment.JSON_FILE_NAME), this.attributes);
}

module.exports = Experiment;
