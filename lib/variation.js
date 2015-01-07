var util = require('util');
var path = require('path');

var fileUtil = require("./file-util");
var logger = require("./logger");
var readConfig = require("./read-config");
var OptimizelyClient = require("./client/OptimizelyClient");
var OptimizelyBase = require("./optimizely-base");

function Variation(attributes, baseDir) {
  Variation.super_.call(this, attributes, baseDir);
}

Variation.JSON_FILE_NAME = "variation.json";
Variation.JS_FILE_NAME = "variation.js";

util.inherits(Variation, OptimizelyBase);

Variation.create = function(attrs, baseDir) {
  //create directory
  fileUtil.writeDir(baseDir);
  fileUtil.writeText(path.join(baseDir, Variation.JS_FILE_NAME));
  fileUtil.writeJSON(path.join(baseDir, Variation.JSON_FILE_NAME), attrs);
  return new Variation(attrs, baseDir);
}

Variation.findByVariationId = function(id) {
  var variation = null;
  var self = this;
  glob.sync("**/experiment.json").forEach(function(dir) {
      if (variation) return;
      var varAttrs;
      dir = dir.substr(0, dir.length - ("experiment.json".length));
      var files = glob.sync(
        dir + "/**/variation.json").map(function(file) {
        return file.substr(0, file.length - (
          "variation.json".length))
      });
      files.forEach(function(file) {
        try {
          varAttrs = JSON.parse(
            fs.readFileSync(file +
              "variation.json"));
        } catch (e) {
          return;
        }
        if (String(varAttrs.variation_id) !== id &&
          varAttrs.description !== id) return;
        //found the variation and experiment directory 
        variation = new Variation({}, file);
        variation.loadFromFile();
        variation.experiment = new Experiment({}, dir);
        variation.experiment.loadFromFile();
      })
    })
  return variation;
}

Variation.prototype.save = function() {
  if (!this.experiment) {
    logger.error("No experiment set for variation, save failed");
    return;
  }
  var experimentAttrs = this.experiment.attributes;
  var attributes = this.attributes;
  attributes.description =
    attributes.description ||
    require("hat")();
  fileUtil.writeDir(experimentAttrs.description +
           "/" +
           attributes.description);
  fileUtil.writeText(
    experimentAttrs.description +
    "/" +
    attributes.description +
    "/" +
    "variation.js",
    attributes.js_component
  );
  fileUtil.writeJSON(
    experimentAttrs.description +
    "/" +
    attributes.description +
    "/" +
    "variation.json",
    attributes);
}

Variation.prototype.getJSPath = function() {
  if (!this.baseDir) {
    logger.log("warn", "no base directory set");
    return null;
  }
  return path.join(this.baseDir, Variation.JS_FILE_NAME);
}

Variation.prototype.getJS = function() {
  return fileUtil.loadFile(this.getJSPath()) || "";
}


module.exports = Variation;
