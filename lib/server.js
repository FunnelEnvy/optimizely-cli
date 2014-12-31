var readConfig = require("./read-config");
var fs = require("fs");
var express = require("express");
var opener = require("opener");
var path = require("path");
var lodash = require("lodash");
var ejs = require("ejs");
var fs = require("fs");
var glob = require("glob");
var originalPath  = path.join(
    path.dirname(fs.realpathSync(__filename)),
    '../');
var serverTemplate = originalPath + "templates/server";
var scriptTemplate = fs.readFileSync(originalPath + "templates/script.ejs",{encoding:"utf-8"});
module.exports = function(port){
    var project = fs.readFileSync("project.json",{encoding:"utf-8"});
    project = JSON.parse(project);
    files = glob.sync("**/experiment.json").map(function(file){
        return file.substr(0, file.length - ("experiment.json".length))});
    //Bulid Experiments
    var experiments = [];
    //Gather Experiments
    files.forEach(function(file){
        var experiment = fs.readFileSync(
            file + "experiment.json", {encoding:"utf-8"});
        experiment = JSON.parse(experiment);
        experiment._css = fs.readFileSync(
            file + "global.css", {encoding:"utf-8"});
        experiment._js =
            fs.readFileSync(file + "global.js", {encoding:"utf-8"});
        if(!experiment._js || experiment._js === "null") experiment._js = "";
        experiment._dir = file;
        experiments.push(experiment)
    })
    //Gather Variations
    experiments = experiments.map(function(experiment){
        var files = glob.sync(
            experiment._dir + "/**/variation.json").map(function(file){
                return file.substr(0, file.length - ("variation.json".length))});
            experiment._variations = [];
            files.forEach(function(file){
                var variation = fs.readFileSync(file + "variation.json");
                variation = JSON.parse(variation);
                variation._url = experiment.edit_url;
                variation._jquery = project.include_jquery ? "jQuery" : "";
                variation._parent = experiment._dir;
                variation._js =
                    fs.readFileSync(
                        file + "variation.js", {encoding:"utf-8"});
                        experiment._variations.push(variation)
                if(!variation._js || variation._js === "null") variation._js = "";
                if(experiment._js) variation._js = experiment._js + "\n" + variation._js;

            })
        return experiment;
    })
    //Start Server
    var app = express();
    app.set('view engine', 'ejs');
    app.get("/", function(req, res){
        res.render(serverTemplate, { experiments : experiments})
    });
    app.get("/:experiment/:variation/script.user.js", function(req, res){
        experiments.forEach(function(experiment){

            if(experiment.id = req.params.experiment){
                experiment._variations.forEach(function(variation){
                    if(String(variation.id) === req.params.variation){

                        res.set({
                            "Content-Type": "text/javascript",
                        })
                        res.end(
                            String(ejs.render(
                                scriptTemplate,
                                {
                                    locals:variation
                                }
                            ))
                        );
                    };
                })
            }
        })
    })
    port = port || 8080;
    app.listen(port,function(){
        console.log("Server listening at ", port);
        console.log("Ctrl-c to quit");
        opener("http://localhost:" + port);
    });
}
