/**
 * Module dependencies
 */

var ejs = require("ejs");
var path = require("path");
var glob = require("glob");
var fs = require("fs");
var logger = require("../logger");
var Experiment = require('../experiment');
var Project = require('../project');
var Assets = require('../assets');

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
  //assume assets are in experiment.baseDir
  this.assets = new Assets({}, this.experiment.baseDir);
  if (this.assets.JSONFileExists()) {
    logger.log("info", "assets file found, loading");
    this.assets.loadFromFile();
  }

  this.port = port || 8080;
  this.locals = {
    _port: this.port,
    edit_url: this.experiment.attributes.edit_url.indexOf('?') === -1 ? 
              this.experiment.attributes.edit_url + '?optcli=activate' : 
              this.experiment.attributes.edit_url + '&optcli=activate',
    experiment_desc: this.experiment.attributes.description,
    variation_desc: this.variation.attributes.description
  }

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

LocalController.prototype.installUserScript = function(req, res) {
  res.end(String(ejs.render(
    this.indexTemplate, {
      locals: this.locals
    }
  )))
}

LocalController.prototype.userScript = function(req, res) {
  this.locals._jquery = this.project.attributes.include_jquery ? "jQuery" : "";
  this.locals._url = this.experiment.attributes.edit_url;
  //Render Userscript
  res.end(String(ejs.render(
    this.installTemplate, {
      locals: this.locals
    }
  )))
}

LocalController.prototype.variationJS = function(req, res) {
  logger.log('debug', process.cwd());
  var vJS = this.compileLocalJS();
  vJS = String(ejs.render(vJS, {
    locals: {
      assets: this.assets.attributes
    }
  }));
  //Render JS
  res.set({
    "Content-Type": "text/javascript"
  });
  res.end(vJS);
}

LocalController.prototype.variationCSS = function(req, res) {
  var css = this.experiment.getCSS();

  if (this.assets.JSONFileExists()) {
    logger.log("info", "assets file found, loading");
    this.assets.loadFromFile();
  }

  //Compile
  css = String(ejs.render(css, {
    locals: {
      assets: this.assets
    }
  }));
  //Render CSS
  res.set({
    "Content-Type": "text/css"
  });
  res.end(css);
}

LocalController.prototype.compileLocalJS = function() {
  var eJS = this.experiment.getJS();
  var vJS = this.variation.getJS();

  if (this.project.attributes.include_jquery){
    var jQueryString = "(" + String(require('./assets/jquery.min.js')) + ")(window)";
    eJS =
      "var jQueryInclude;\n"
      + jQueryString + ";\n" +
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
}

module.exports = LocalController;
