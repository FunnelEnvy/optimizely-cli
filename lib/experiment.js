var hat = require('hat');
var glob = require('glob');
var fs = require('fs');
var path = require('path');
var util = require('util');

var fileUtil = require("./file-util");
var logger = require("./logger");
var Variation = require("./variation");
var OptimizelyBase = require("./optimizely-base");

function Experiment(attributes, baseDir) {
  Experiment.super_.call(this, attributes, baseDir);
}

Experiment.JSON_FILE_NAME = "experiment.json";
Experiment.JS_FILE_NAME = "global.js";
Experiment.CSS_FILE_NAME = "global.css";


util.inherits(Experiment, OptimizelyBase);

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

Experiment.prototype.save = function(writeVars) {
  logger.log('debug', 'saving experiment');
  attributes = this.attributes;
  attributes.description =
    attributes.description || hat();
  fileUtil.writeDir(attributes.description);
  fileUtil.writeText(
    attributes.description +
    "/" + "global.css", attributes.custom_css);
  fileUtil.writeText(
    attributes.description +
    "/" + "global.js", attributes.custom_js);
  fileUtil.writeJSON(
    attributes.description +
    "/" + "experiment.json", attributes);
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

module.exports = Experiment;
