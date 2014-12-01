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
var installTemplate = fs.readFileSync(
    originalPath + "templates/install.ejs",{encoding:"utf-8"});

module.exports = function(id, port){
    var locals = {};
    var js = "";
    var css = "";
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
            file + "custom.css", {encoding:"utf-8"});
        experiment._js =
            fs.readFileSync(file + "custom.js", {encoding:"utf-8"});
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
                if(String(variation.variation_id) !== id) return;
                variation._url = experiment.edit_url;
                variation._jquery = project.include_jquery ? "jQuery" : "";
                locals = variation;
                locals._port = port || 8080;
                css = experiment._css;
                js = fs.readFileSync(
                    file + "js_component.js", {encoding:"utf-8"});
                if(!js || js ==="null" ) js = "";
                if(experiment._js) js = experiment._js + "\n" + js;
            })
        return experiment;
    })
    //Start Server
    var app = express();
    app.set('view engine', 'ejs');
    app.get("/", function(req, res){
        res.end("<a href=\"/install.user.js\"><button type=\"button\">Install</button></a>");
    })
    app.get("/install.user.js", function(req, res){
        res.end(String(ejs.render(
            installTemplate,{
                locals : locals
            }
        )))
    })
    app.get("/variation.js", function(req, res){
        res.set({
            "Content-Type": "text/javascript",
        })
        res.end(js);
    })
    app.get("/variation.css", function(req, res){
        res.set({
            "Content-Type": "text/css",
        })
        res.end(css);
    })
    port = port || 8080;
    app.listen(port,function(){
        console.log("Server listening at ", locals._port);
        console.log("Ctrl-c to quit");
    });
}
