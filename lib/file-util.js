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
    if (fs.existsSync(fileName)){
      configItem = JSON.parse(
        fs.readFileSync(fileName, {
          encoding: "utf-8"
        }));
      return configItem;
    } else {
      return false;
    }
    
  },
  loadFile: function(fileName) {
    var theFile;
    if (fs.existsSync(fileName)){
      theFile = fs.readFileSync(fileName, {
          encoding: "utf-8"
        });
      return theFile;
    } else {
      return false;
    }
  }
}


