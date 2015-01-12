var fs = require('fs');
var logger = require("./logger");

module.exports = {
  writeDir: function(name) {
    fs.mkdirSync(name);
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
    configItem = JSON.parse(
      fs.readFileSync(fileName, {
        encoding: "utf-8"
      }));
    return configItem;
  },
  loadFile: function(fileName) {
    var theFile;
    theFile = fs.readFileSync(fileName, {
        encoding: "utf-8"
      });
    return theFile;
  }
}


