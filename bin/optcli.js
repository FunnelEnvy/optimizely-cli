#!/usr/bin/env node

var program = require("commander");
var path = require("path");
var fs = require("fs")
var optinPackage = require(path.join(__dirname, "../", "package.json"));
var logger = require("../lib/logger.js");

/* commands */
var loadCommand = function(cmd) {
  var self = this;
  return function() {
    require("../lib/commands/" + cmd)
      .apply(self, arguments);
  }
}

function required(val, option) {
  if (val.length === 0) {
    logger.log("error", option + " is required, exiting");
    process.exit(1);
  }
}

//default log level
//TODO: parameterize this
logger.debugLevel = 'debug';

program
  .version(optinPackage.version)
  .usage(" - " + optinPackage.description)
  .description(optinPackage.description)
  .option("-o --option [value]", "generic option")

program
  .command("init [project_id]")
  .description("Initialize an optimizely project.")
  .action(loadCommand("init-project"));

program
  .command("experiment <folder> <description> <url>")
  .description("Create Local Experiment")
  .action(loadCommand("create-experiment"));

program
  .command("variation <experiment> <folder> <description>")
  .description("Create Local Variation")
  .action(loadCommand("create-variation"));

program
  .command("host <path> [port]")
  .option("-s --ssl", "SSL")
  .option("-k --key [path]", "path to key file (for SSL)")
  .option("-c --crt [path]", "path to certificate file (for SSL)")
  .description("Host variation locally")
  .action(loadCommand("host"));

program
  .command("push-experiment <path>")
  .description("Push an experiment to Optimizely")
  .action(loadCommand("push-experiment"));

program
  .command("push-variation <path>")
  .description("Push a variation to Optimizely (experiment must be pushed first)")
  .action(loadCommand("push-variation"));

// program
//   .command("pull <object>")
//   .description("Create Experiment")
//   .option("-r --remote", "Create variation remotely as well as locally.")
//   .action(loadCommand("push"));

program
   .command('*')
   .action(function(env) {
     console.log('sorry, I don\'t know how to do that');
   });

program.parse(process.argv);
