/**
 * Module dependencies
 */
var express = require("express");
var opener = require("opener");
var path = require('path');

var readConfig = require("../read-config");
var LocalController = require('../server/controller');
var Variation = require('../variation');


module.exports = function(varPath, port, program) {
  //Start Server
  var app = express();
  app.set('view engine', 'ejs');

  //configure the controller
  varPath = path.resolve(process.cwd(), varPath);
  var variation = new Variation({}, varPath);
  variation.loadFromFile();

  if (!variation) {
    console.log("No variation with id or description: \"" + id +
      "\" found");
    return;
  }

  //local controller for the requests
  localController = new LocalController(variation, port);

  //set the routes
  app.get("/", localController.installUserScript.bind(localController)); 
  app.get("/install.user.js", localController.userScript.bind(localController));
  app.get("/variation.js", localController.variationJS.bind(localController));
  app.get("/variation.css", localController.variationCSS.bind(localController));

  //start the server
  app.listen(localController.port, function() {
    console.log("Serving variation " + path + " at port " + localController.port);
    console.log("Ctrl-c to quit");
  });
}
