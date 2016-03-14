var util = require('util');
var fs = require('fs');
var logger = require("./logger");
var ejs = require("ejs");

var OptCLIBase = require("./optcli-base");

function Files(attributes, baseDir, assets) {
  Files.super_.call(this, attributes, baseDir);
  //get HTML files in the experiment folder
  this.filenames = fs.readdirSync(baseDir);
  
  this.data = {};
  
  //check for HTML or EJS files
  if(this.filenames.length) {
    for(var i = this.filenames.length - 1; i >= 0; i--) {
      if(this.filenames[i].indexOf('.html') === -1 && this.filenames[i].indexOf('.ejs') === -1) {
        this.filenames.splice(i, 1);
      }
    }

    for(i = 0; i < this.filenames.length; i++) {
      var filename = this.filenames[i];
      var filekey = filename.split(/(\.html|\.ejs)/)[0];
      var filedata = fs.readFileSync(this.baseDir + '/' + filename, 'utf8');
      
      // Run the file data through EJS if assets were passed.
      if(assets) {
        filedata = String(ejs.render(filedata, {
          locals: {
            assets: assets.attributes
          }
        }));
      }
      
      // Minify by removing line breaks, tabs, and excess white space
      filedata = filedata.replace(/(\t|\r\n|\r|\n)/gm,' ');
      filedata = filedata.replace(/ {2,}/g, ' ');
      filedata = filedata.replace(/> /g, '>');
      filedata = filedata.replace(/ </g, '<');
      
      // Comment out quotes
      filedata = filedata.replace(/\\(['"])/g,'\\\\$1');
      filedata = filedata.replace(/(['"])/g, '\\$1');
      
      this.data[filekey] = filedata;
    }
  }
}

util.inherits(Files, OptCLIBase);

module.exports = Files;
