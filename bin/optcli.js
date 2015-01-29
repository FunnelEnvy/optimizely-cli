#!/usr/bin/env node

var program = require("commander");
var path = require("path");
var optcliPackage = require(path.join(__dirname, "../", "package.json"));
var logger = require("../lib/logger.js");

/* commands */
var loadCommand = function(cmd) {
  var self = this;
  return function() {
    require("../lib/commands/" + cmd)
      .apply(self, arguments);
  }
}

//default log level
logger.debugLevel = 'info';

function increaseVerbosity(v) {
  logger.debugLevel = 'debug';
}

program
  .version(optcliPackage.version)
  .usage(" - " + optcliPackage.description)
  .description(optcliPackage.description)
  .option("-v --verbose", "show debug output", increaseVerbosity)

program
  .command("init [project_id]")
  .description("Initialize an optimizely project.")
  .option("-r --remote", "initialize from remote project")
  .option("-j --jquery", "include jquery (local project only)")
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
  .description("Host variation locally")
  .action(loadCommand("host"));

program
  .command("push-experiment <path>")
  .option("-i --iterate", "Push experiment iterate through all variations")
  .description("Push an experiment to Optimizely")
  .action(loadCommand("push-experiment"));

program
  .command("push-variation <path>")
  .description(
    "Push a variation to Optimizely (experiment must be pushed first)")
  .action(loadCommand("push-variation"));

//Show help if no arguments are passed
if (!process.argv.slice(2).length) {
  program._name = process.argv[1];
  program._name = program._name.substr(program._name.lastIndexOf("/") + 1);
  program.outputHelp();
}

program.parse(process.argv);
