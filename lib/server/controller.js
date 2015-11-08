/**
 * Module dependencies
 */

var ejs = require("ejs");
var path = require("path");
var fs = require("fs");
var logger = require("../logger");
var Experiment = require('../experiment');
var Project = require('../project');
var Assets = require('../assets');
var Files = require('../files');

function LocalController(variation, port) {
  this.variation = variation;
  //assume the directory above the variation
  //maybe move this to Experiment?
  this.experiment = new Experiment({}, path.normalize(variation.baseDir + "/.."));
  if(!this.experiment.loadFromFile()) {
    throw new Error("no experiment.json found");
  }
  this.project = new Project({}, "./");
  if(!this.project.loadFromFile()) {
    throw new Error("no project.json found");
  }

  this.port = port || 8080;

  this.locals = {
    _port: this.port,
    edit_url: this.experiment.getOptcliURL(),
    experiment_desc: this.experiment.attributes.description,
    variation_desc: this.variation.attributes.description
  };

  //load the templates
  var originalPath = path.join(
    path.dirname(fs.realpathSync(__filename)),
    '../../');

  this.installTemplate = fs.readFileSync(
    originalPath + "templates/install.user.js.ejs", {
      encoding: "utf-8"
    });

  this.indexTemplate = fs.readFileSync(
    originalPath + "templates/index.ejs", {
      encoding: "utf-8"
    });

}

// Compile assets and files in their own method so they can be dynamically updated
LocalController.prototype.getAssets = function(getFiles) {
  //assume assets are in experiment.baseDir
  this.assets = this.assets || new Assets({}, this.experiment.baseDir);
  if (this.assets.JSONFileExists()) {
    logger.log("info", "assets file found, loading");
    this.assets.loadFromFile();
  }
  
  if(getFiles) {
    //get any available file data
    //pass in assets in case any of the files use additional EJS
    this.files = new Files({}, this.experiment.baseDir, this.assets);
    if (this.files.filenames.length) {
      logger.log("info", 'Loading these external files: ' + this.files.filenames.join(''));
    }
  }
}

LocalController.prototype.installUserScript = function(req, res) {
  res.end(String(ejs.render(
    this.indexTemplate, {
      locals: this.locals
    }
  )));
};

LocalController.prototype.userScript = function(req, res) {
  this.locals._jquery = this.project.attributes.include_jquery ? "jQuery" : "";
  this.locals._url = this.experiment.attributes.edit_url;
  //Render Userscript
  res.end(String(ejs.render(
    this.installTemplate, {
      locals: this.locals
    }
  )));
};

LocalController.prototype.variationJS = function(req, res) {
  logger.log('debug', process.cwd());
  var vJS = this.compileLocalJS();
  this.getAssets(true);
  vJS = String(ejs.render(vJS, {
    locals: {
      assets: this.assets.attributes,
      files: this.files.data
    }
  }));
  //Render JS
  res.set({
    "Content-Type": "text/javascript"
  });
  res.end(vJS);
};

LocalController.prototype.variationCSS = function(req, res) {
  var css = this.experiment.getCSS();
  this.getAssets();

  //Compile
  css = String(ejs.render(css, {
    locals: {
      assets: this.assets.attributes
    }
  }));
  //Render CSS
  res.set({
    "Content-Type": "text/css"
  });
  res.end(css);
};

LocalController.prototype.compileLocalJS = function() {
  var eJS = this.experiment.getJS();
  var vJS = this.variation.getJS();

  if (this.project.attributes.include_jquery){
    var jQueryString = "(" + String(require('./assets/jquery.min.js')) + ")(window)";
    eJS =
      "var jQueryInclude;\n" + 
      jQueryString + ";\n" +
      "(function($, jQuery){\n/*Experiment JavaScript*/\n" +
      eJS + "\n/*Experiment JavaScript*/\n" +
      "})(jQueryInclude, jQueryInclude);";
    vJS =
      "(function($, jQuery){\n/*Variation JavaScript*/\n" +
      vJS + "\n/*Variation JavaScript*/\n" +
      "})(jQueryInclude, jQueryInclude);";
    vJS = eJS + "\n\n" + vJS;
    return vJS;
  } else {
    eJS =
      "(function(){\n/*Experiment JavaScript*/\n" +
      eJS + "\n/*Experiment JavaScript*/\n" +
      "})();";
    vJS =
      "(function(){\n/*Variation JavaScript*/\n" +
      vJS + "\n/*Variation JavaScript*/\n" +
      "})();";
    vJS = eJS + "\n\n" + vJS;
    return vJS;
  }
};

module.exports = LocalController;
