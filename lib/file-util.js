var fs = require('fs');
var logger = require("./logger");

module.exports = {
  writeDir: function(name) {
    logger.log("debug", "writing directory: " + name);
    try {
        fs.mkdirSync(name);
    } catch (e) {
      logger.log("error", "could not write directory: " + name);
      logger.log("error", e.toString());
    }
  },
  writeJSON: function(name, data) {
    fs.writeFileSync(
        name,
        data ? JSON.stringify(data, null, "    ") : ""
    );
    return data;
  },
  writeText: function(name, data) {
    fs.writeFileSync(
        name,
        data || ""
    );
    return data;
  },
  loadConfigItem: function(fileName) {
    var configItem;
    try {
      configItem = JSON.parse(
        fs.readFileSync(fileName, {
          encoding: "utf-8"
        }));
    } catch (e) {
      logger.log("warn", "could not read: " + fileName);
      configItem = null;
    }
    return configItem;
  },
  loadFile: function(fileName) {
    var theFile;
    try {
      theFile = fs.readFileSync(fileName, {
          encoding: "utf-8"
        });
    } catch (e) {
      logger.log("warn", "could not read: " + fileName);
      theFile = null;
    }
    return theFile;
  }
}


