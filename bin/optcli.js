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
    .description("Host")
    .action(loadCommand("host"));

program
    .command("init [project_description]")
    .description("Initialize an optimizely project.")
    .option("-r --remote", "Initialize project remotely as well as locally.")
    .option("-p --pull", "Pull project by initializing")
    .option("-j --jquery", "Include Jquery (new project)")
    .option("-a --archive", "Archive (new project)")
    .option("-e --experiments", "Download experiments.")
    .option("-v --variations", "Download variations. (Implies --experiments)")
    .action(loadCommand("init-project"));

program
    .command("experiment <description> <url> [variation_descriptions]")
    .description("Create Experiment Host")
    .option("-r --remote", "Create experiment remotely as well as locally.")
    .action(loadCommand("create-experiment"));

/*
program
.command("experiment <description> [variation_descriptions...]")
.description("Create an experiment")
.option("-r --remote", "Initialize experiment remotely as well as locally.")
.action(loadCommand("init-project"));


program
.command("variation <experiment> [description]")
.description("Create a variation")
.option("-r --remote", "Initialize variation remotely as well as locally.")
.action(loadCommand("init-project"));

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
.command("sync [id]")
.description("Sync objects")
.option("-u --upstream", "Sync upstream")
.option("-d --downstream", "Sync downstream")
.action(loadCommand("init-project"));

program
.command("asset <path> [name]")
.description("Sync objects")
.option("-u --upstream", "Sync upstream")
.option("-d --downstream", "Sync downstream")
.action(loadCommand("init-project"));


*/

//

program
    .command("set-token [token]")
    .description("Set Optimizely API Token")
    .action(loadCommand("set-token"));

program
    .command("set-project [project_id]")
    .description("Set Optimizely Project Id")
    .action(loadCommand("set-project"));

program
    .command("show-token")
    .description("Show Optimizely Token")
    .action(loadCommand("show-token"));
program

    .command("clone [directory]")
    .description("Clone optimizely project")
    .option("-l --local", "initialize project locally")
    .action(loadCommand("clone"));

program
    .command("add-variation <experiment_id> <description>")
    .description("Add a variation to an experiment.")
    .action(loadCommand("create-variation"));

program
    .command("push-variation <path>")
    .description("Add a variation to an experiment.")
    .action(loadCommand("push-variations"));

program
    .command("open-variation <variation_id>")
    .description("Add a variation to an experiment.")
    .action(loadCommand("open-variation"));

program
    .command("update-variation <variation_id>")
    .description("Add a variation to an experiment.")
    .action(loadCommand("update-variation"));


program
    .command("experiments")
    .description("List Experiments")
    .action(loadCommand("list-experiments"));

program
    .command("variations")
    .description("List Variations")
    .action(loadCommand("list-variations"));

program
    .command("server [port]")
    .description("Start Installation Server")
    .action(loadCommand("server"));


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
