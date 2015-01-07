var path = require('path');
var fs = require('fs');

var fileUtil = require('./file-util');
var logger = require('./logger');

function OptimizelyBase(attributes, baseDir) {
  if (attributes) {
    this.attributes = attributes;
  } else {
    this.attributes = {};
  }
  this.baseDir = (baseDir) ? baseDir : null;
}


OptimizelyBase.prototype.setBaseDir = function(baseDir) {
  this.baseDir = baseDir;
}

OptimizelyBase.prototype.getJSONPath = function() {
  if (!this.baseDir) {
    logger.log("warn", "no base directory set");
    return null;
  }
  return path.join(this.baseDir, this.constructor.JSON_FILE_NAME);
}

OptimizelyBase.prototype.loadFromFile = function() {
  this.attributes = fileUtil.loadConfigItem(this.getJSONPath()) || {};
  return this.attributes;
}

module.exports = OptimizelyBase;
