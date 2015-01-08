/**
 * Module dependencies
 */
var express = require("express");
var path = require('path');
var fs = require('fs');

var readConfig = require("../read-config");
var LocalController = require('../server/controller');
var Variation = require('../variation');

var getSSLCredentials = function() {
  var originalPath = path.join(
    path.dirname(fs.realpathSync(__filename)),
    '../../');
  var credentials = {
    key: fs.readFileSync(originalPath + "ssl/server.key", 'utf8'),
    cert: fs.readFileSync(originalPath + "ssl/server.crt", 'utf8')
  };
  return credentials;
}

module.exports = function(varPath, port, program) {
  //Start Server
  var app = express();
  app.set('view engine', 'ejs');

  //configure the controller
  var varPath = path.resolve(process.cwd(), varPath);
  var variation = new Variation({}, varPath);
  variation.loadFromFile();

  if (!variation) {
    logger.log("error", "No variation at path: \"" + varPath +
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
     var httpsServer = require('https').createServer(getSSLCredentials(), app);
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
