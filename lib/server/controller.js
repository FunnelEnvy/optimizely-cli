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
  this.experiment.loadFromFile();
  this.project = new Project({}, "./");
  this.project.loadFromFile();
  //assume assets are in variation.baseDir
  this.assets = new Assets({}, variation.baseDir);
  this.assets.loadFromFile();

  this.port = port || 8080;
  this.locals = {
    _port: this.port
  }


  //set default locals 
  this.locals.name =
    this.locals.namespace =
    this.locals.description =
    this.experiment.attributes.description || "";

  //load the templates
  var originalPath = path.join(
    path.dirname(fs.realpathSync(__filename)),
    '../../');

  this.installTemplate = fs.readFileSync(
    originalPath + "templates/install.user.js.ejs", {
      encoding: "utf-8"
    });
}

LocalController.prototype.installUserScript = function(req, res) {
  //Render Installation Button
  res.end(
    "<a href=\"/install.user.js\"><button type=\"button\">Install</button></a>"
  );
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
  var assets = this.assets.loadFromFile();

  //Compile
  css = String(ejs.render(css, {
    locals: {
      assets: assets
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
  eJS =
    "(function($, jQuery){\n/*Experiment JavaScript*/\n" +
    eJS + "\n/*Experiment JavaScript*/\n" +
    "})(typeof jQuery !== 'undefined'? jQuery : $, typeof jQuery !== 'undefined'? jQuery : $);";
  vJS =
    "(function($, jQuery){\n/*Variation JavaScript*/\n" +
    vJS + "\n/*Variation JavaScript*/\n" +
    "})(typeof jQuery !== 'undefined' ? jQuery : $, typeof jQuery !== 'undefined'? jQuery : $);";
  vJS = eJS + "\n\n" + vJS;
  return vJS;
}


module.exports = LocalController;
