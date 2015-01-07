var util = require('util');

var OptimizelyBase = require("./optimizely-base");

function Assets(attributes, baseDir) {
  Assets.super_.call(this, attributes, baseDir);
}

Assets.JSON_FILE_NAME = "assets.json";

util.inherits(Assets, OptimizelyBase);

module.exports = Assets;
