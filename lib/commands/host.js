/**
 * Module dependencies
 */
var express = require("express");
var path = require('path');
var fs = require('fs');
var logger = require('../logger');

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
  try {
    localController = new LocalController(variation, port);
  } catch(error) {
    logger.log("error", error.message);
    return;
  }

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
     httpsServer.on('error', function(err){
      if(err.errno === 'EADDRINUSE') logger.log('error', 'Port already in use. Kill the other process or use another port.');
      else logger.log("error", err.message);
     });
  } else {
    var server = app.listen(localController.port, function() {
      console.log("Serving variation " + varPath + " at port " + localController.port);
      console.log("point your browser to http://localhost:" + localController.port);
      console.log("Ctrl-c to quit");
    });
    server.on('error', function(err){
      if(err.errno === 'EADDRINUSE') logger.log('error', 'Port already in use. Kill the other process or use another port.');
      else logger.log("error", err.message);
    })
  }
}
