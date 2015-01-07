/**
 * Module dependencies
 */
var express = require("express");
var opener = require("opener");
var path = require('path');
var fs = require('fs');

var readConfig = require("../read-config");
var LocalController = require('../server/controller');
var Variation = require('../variation');


module.exports = function(varPath, port, program) {
  //Start Server
  var app = express();
  app.set('view engine', 'ejs');

  //configure the controller
  var varPath = path.resolve(process.cwd(), varPath);
  var variation = new Variation({}, varPath);
  variation.loadFromFile();

  if (!variation) {
    console.log("No variation at path: \"" + varPath +
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
  if (program.ssl) {
    var credentials = {
      key: fs.readFileSync(program.key, 'utf8'),
      cert: fs.readFileSync(program.crt, 'utf8')
     };
     var httpsServer = require('https').createServer(credentials, app);
     httpsServer.listen(localController.port, function() {
       console.log("Serving https variation " + varPath + " at port " + localController.port);
       console.log("point your browser to https://localhost:" + localController.port);
       console.log("Ctrl-c to quit");
     });
  } else {
    app.listen(localController.port, function() {
      console.log("Serving variation " + varPath + " at port " + localController.port);
      console.log("point your browser to http://localhost:" + localController.port);
      console.log("Ctrl-c to quit");
    });
  }
}
