var util = require('util');

var OptCLIBase = require("./optcli-base");

function Assets(attributes, baseDir) {
  Assets.super_.call(this, attributes, baseDir);
}

Assets.JSON_FILE_NAME = "assets.json";

util.inherits(Assets, OptCLIBase);

module.exports = Assets;
