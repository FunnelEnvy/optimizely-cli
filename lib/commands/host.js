/**
 * Module dependencies
 */
var express = require("express");
var path = require('path');
var fs = require('fs');
var open = require('open');
var logger = require('../logger');

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
};

var handleStartupError = function(error){
  if(error.errno === 'EADDRINUSE') {
    logger.log('error', 'Port already in use. Kill the other process or use another port.');
  } else {
    logger.log("error", error.message);
  }
};


module.exports = function(varPath, port, program) {
  //Start Server
  var app = express();
  var localController;

  app.set('view engine', 'ejs');

  //configure the controller
  varPath = path.resolve(process.cwd(), varPath);
  var variation = new Variation({}, varPath);
  variation.loadFromFile();

  if (!variation) {
    return logger.log("error", "No variation at path: \"" + varPath +
      "\" found");
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
  var onStartup = function(){
    if(!program.silence){
      console.log("Serving variation " + varPath + " at port " + localController.port);
      console.log("point your browser to http" + (program.ssl ? "s" : "") + "://localhost:" + localController.port);
      console.log("Ctrl-c to quit");
    }
    if(program.open){
      open("http" + (program.ssl ? "s" : "") + "://localhost:" + localController.port);
    }
  };

  if (program.ssl) {
     return require('https').createServer(getSSLCredentials(), app)
       .listen(localController.port, onStartup)
       .on('error', handleStartupError);
  } else {
    return app
      .listen(localController.port, onStartup)
      .on('error', handleStartupError);
  }
};
