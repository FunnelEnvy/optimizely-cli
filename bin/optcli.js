#!/usr/bin/env node

var program = require("commander");
var path = require("path");
var fs = require("fs")
var optinPackage = require(path.join(__dirname, "../", "package.json"));
var q = require("q");
/* commands */

var loadCommand = function(cmd) {
  var self = this;
  return function() {
    require("../lib/" + cmd)
      .apply(self, arguments);
  }
}
program
  .version(optinPackage.version)
  .usage(" - " + optinPackage.description)
  .description(optinPackage.description)
  .option("-o --option [value]", "generic option")

program
  .command("host <variation_id> [port]")
  .description("Host Variations")
  .action(loadCommand("host"));

program
  .command("init [project_description]")
  .description("Initialize an optimizely project.")
  .option("-r --remote", "Initialize project remotely as well as locally.")
  .option("-p --pull", "Pull project by initializing")
  .option("-j --jquery", "Include jQuery (new project)")
  .option("-a --archive", "Archive (new project)")
  .option("-e --experiments", "Download experiments.")
  .option("-v --variations", "Download variations. (Implies --experiments)")
  .action(loadCommand("init-project"));

program
  .command("experiment <description> <url> [variation_descriptions]")
  .description("Create Variation")
  .option("-r --remote", "Create experiment remotely as well as locally.")
  .action(loadCommand("create-experiment"));

program
  .command("variation <experiment> <descriptions>")
  .description("Create Experiment")
  .option("-r --remote", "Create variation remotely as well as locally.")
  .action(loadCommand("create-variation"));

program
  .command("push <experiment> [variation...]")
  .description("Create Experiment")
  .option("-r --remote", "Create variation remotely as well as locally.")
  .action(loadCommand("push"));

program
  .command('example')
  .description("Show Examples")
  .action(function() {
    console.log('  Examples:');
    console.log('');
    console.log('    Create Experiment Remotely:');
    console.log('');
    console.log('      optcli init --remote <project_id>');
    console.log('      optcli experiment "exp 1" "www.example.com"');
    console.log('      optcli variation "exp 1" "var 1"');
    console.log('      #This is where you edit files');
    console.log('      optcli push "exp 1" "var 1"');
    console.log('');
    console.log('    Install and Host Local Experiment Variation:');
    console.log('');
    console.log('      optcli host "exp1" "var 1" 8080');
    console.log('      #visit localhost:8080 to install script');
    console.log('      #visit experiment url');
    console.log('      #edits will be visible upon refresh');
  })



/*
program
    .command("list <experiment> <descriptions>")
    .description("List all experiments and variations")
    .option("-r --remote", "Include remote experiments and variations")
    .action(loadCommand("list"));

program
  .command("list")
  .description("List experiments and variations")
  .option("-r --remote", "List remote projects as well as local experiments.")
  .action(loadCommand("init-project"));

program
  .command("status")
  .description("Show project status")
  .option("-r --remote", "Also show remote project status.")
  .action(loadCommand("init-project"));

program
  .command("asset <path> [name]")
  .description("Sync objects")
  .option("-u --upstream", "Sync upstream")
  .option("-d --downstream", "Sync downstream")
  .action(loadCommand("init-project"));

program
    .command("set-token [token]")
    .description("Set Optimizely API Token")
    .action(loadCommand("set-token"));

program
    .command("open-variation <variation_id>")
    .description("Add a variation to an experiment.")
    .action(loadCommand("open-variation"));

program
    .command("server [port]")
    .description("Start Installation Server")
    .action(loadCommand("server"));
    */


/*
program
.command("")
.description("")
.action(function(arg) {
    program.help();
});
*/

program
  .command("*")
  .description("")
  .action(function(arg) {
    console.log("invalid command: '%s'", arg);
    program.help();
  });



program.parse(process.argv);
