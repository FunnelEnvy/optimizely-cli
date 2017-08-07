var util = require('util');
var path = require('path');
var _ = require("lodash");
var ejs = require("ejs");

var fileUtil = require("./file-util");
var logger = require("./logger");
var readConfig = require("./read-config");
var OptimizelyClient = require("optimizely-node-client");
var OptCLIBase = require("./optcli-base");
var Assets = require('./assets');
var Files = require('./files');

function Variation(attributes, baseDir) {
  Variation.super_.call(this, attributes, baseDir);
}

Variation.JSON_FILE_NAME = "variation.json";
Variation.JS_FILE_NAME = "variation.js";
Variation.CSS_FILE_NAME = "variation.css";

util.inherits(Variation, OptCLIBase);

Variation.create = function(attrs, baseDir) {
  //create directory
  fileUtil.writeDir(baseDir);
  fileUtil.writeText(path.join(baseDir, Variation.JS_FILE_NAME));
  fileUtil.writeJSON(path.join(baseDir, Variation.JSON_FILE_NAME), attrs);
  return new Variation(attrs, baseDir);
}

Variation.prototype.getCSSPath = function() {
  return this.getFilePath(Variation.CSS_FILE_NAME);
}

Variation.prototype.getCSS = function() {
  return fileUtil.loadFile(this.getCSSPath()) || "";
}

Variation.prototype.getJSPath = function() {
  return this.getFilePath(Variation.JS_FILE_NAME);
}

Variation.prototype.getJS = function() {
  return fileUtil.loadFile(this.getJSPath()) || "";
}

Variation.prototype.createRemote = function(client, remote) {
  //assume assets are in experiment.baseDir
  var assets = new Assets({}, path.normalize(this.baseDir + "/.."));
  if (assets.JSONFileExists()) {
    logger.log("info", "assets file found, loading");
    assets.loadFromFile();
  }
  
  //get any available file data
  //pass in assets in case any of the files use additional EJS
  var files = new Files({}, path.normalize(this.baseDir + "/.."), assets);
  if (files.filenames.length) {
    logger.log("info", 'Loading the following external files: "' + files.filenames.join('" "') + '"');
  }

  //create new variation
  var varArgs = _.clone(this.attributes);
  varArgs['js_component'] = String(ejs.render(this.getJS(), {
    locals: {
      assets: assets.attributes,
      files: files.data
    }
  }));
  varArgs['experiment_id'] = experiment.attributes.id;

  var self = this;
  return client.createVariation(varArgs).then(function(variationAttrs) {
    //update the id
    self.attributes.id = variationAttrs.id;
    self.saveAttributes();
    logger.log("info", "created remote variation: " + variationAttrs.id);
  }, function(error) {
    logger.log("error", error);
    logger.log("error", "unable to create remote variation: " + e.message);
    console.error(e.stack);
  });
}

Variation.prototype.updateRemote = function(client) {
  //assume assets are in experiment.baseDir
  var assets = new Assets({}, path.normalize(this.baseDir + "/.."));
  if (assets.JSONFileExists()) {
    logger.log("info", "assets file found, loading");
    assets.loadFromFile();
  }
  
  //get any available file data
  //pass in assets in case any of the files use additional EJS
  var files = new Files({}, path.normalize(this.baseDir + "/.."), assets);
  if (files.filenames.length) {
    logger.log("info", 'Loading the following external files: "' + files.filenames.join('" "') + '"');
  }
  
  var varArgs = _.clone(this.attributes);
  varArgs['js_component'] = String(ejs.render(this.getJS(), {
    locals: {
      assets: assets.attributes,
      files: files.data
    }
  }));

  var self = this;
  return client.updateVariation(varArgs).then(function(variationAttrs) {
    logger.log("info", "updated remote variation: " + variationAttrs.id);
  }, function(error) {
    logger.log("error", error);
  }).catch(function(e) {
    logger.log("error", "unable to update remote variation: " + e.message);
    console.error(e.stack);
  });
}

Variation.prototype.saveAttributes = function() {
  fileUtil.writeJSON(path.join(this.baseDir, Variation.JSON_FILE_NAME), this.attributes);
}

module.exports = Variation;
