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
    originalPath + "templates/install.user.js.ejs",{encoding:"utf-8"});

module.exports = function(id, port){
    port = port || 8080;
    var locals = {_port:port};
    var experimentJSON;
    var experimentCSS;
    var experimentJS;
    var variationJSON;
    var variationJS;
    var variationFound = false;
    glob.sync("**/experiment.json").forEach(function(dir){
        if(variationFound) return;
        dir = dir.substr(0, dir.length - ("experiment.json".length));
        var files = glob.sync(
            dir + "/**/variation.json").map(function(file){
                return file.substr(0, file.length - ("variation.json".length))});
            files.forEach(function(file){
                var variation;
                var experiment;
                try{
                    variation = JSON.parse(
                        fs.readFileSync(file + "variation.json"));
                }catch(e){
                    return;
                }
                if(String(variation.variation_id) !== id
                    && variation.description !== id) return;
                experimentJSON = dir + "experiment.json";
                experimentCSS = dir + "custom.css";
                experimentJS = dir + "custom.js";
                variationJSON = file + "variation.json";
                variationJS = file + "js_component.js";
                try{
                    experiment = JSON.parse(
                        fs.readFileSync(experimentJSON));
                }catch(e){
                    experiment = {};
                }
                locals.name =
                locals.namespace =
                locals.description =
                experiment.description || "";
                variationFound = true;
            })
    })
    //Start Server
    var app = express();
    app.set('view engine', 'ejs');//DELETE???

    //Endpoint - Install Script
    app.get("/", function(req, res){
        //Render Installation Button
        res.end("<a href=\"/install.user.js\"><button type=\"button\">Install</button></a>");
    })

    //Endpoint - Installed Script
    app.get("/install.user.js", function(req, res){
        var project;
        var experiment;
        //Get Project
        try{
            project = JSON.parse(
                fs.readFileSync("project.json",{encoding:"utf-8"}));
        }catch(e){project = {};}
        //Get Experiment
        try{
            experiment = JSON.parse(
                fs.readFileSync(experimentJSON,{encoding:"utf-8"}));
        }catch(e){experiment = {};}
        locals._jquery = project.include_jquery ? "jQuery" : "";
        locals._url = experiment.edit_url;
        //Render Userscript
        res.end(String(ejs.render(
            installTemplate,{
                locals : locals
            }
        )))
    })
    //Endpoint - GetVriation
    app.get("/variation.js", function(req, res){
        var project, eJSON, vJSON, eJS, vJS;
        //Get Project
        try{
            project = JSON.parse(
                fs.readFileSync("project.json",{encoding:"utf-8"}));
        }catch(e){project = {};}
        //Get Experiment
        try{
            eJSON = fs.readFileSync(
                experimentJSON, {encoding:"utf-8"});
            }catch(e){eJSON = "";}
        //Get Variation
        try{
            vJSON = fs.readFileSync(
                variationJSON, {encoding:"utf-8"});
        }catch(e){vJSON = "";}
        //Get Experiment JS
        try{
            eJS = fs.readFileSync(
                experimentJS, {encoding:"utf-8"});
        }catch(e){eJS = "/e";}
        //Get Variation JS
        try{
            vJS = fs.readFileSync(
                variationJS, {encoding:"utf-8"});
        }catch(e){vJS = "";}
        //Get Assets
        try{
            assets = JSON.parse(fs.readFileSync(
                "assets.json", {encoding:"utf-8"}))
            }catch(e){assets = {};}
        //Compile
        eJS = "/*Experiment Level JavaScript*/\n(function($, jQuery){\n" + eJS +
        "})(typeof jQuery !== 'undefined'? jQuery : $, typeof jQuery !== 'undefined'? jQuery : $);";
        vJS = "/*Variation Level JavaScript*/\n(function($, jQUery){\n" + vJS +
        "})(typeof jQuery !== 'undefined' ? jQuery : $, typeof jQuery !== 'undefined'? jQuery : $);";
        vJS = eJS + "\n\n" + vJS;
        vJS = String(ejs.render(vJS,{locals:{assets:assets}}));
        //Render JS
        res.set({"Content-Type": "text/javascript"});
        res.end(vJS);
    })
    app.get("/variation.css", function(req, res){
        var css;
        var assets;
        //Get Experiment CSS
        try{
            css = fs.readFileSync(
                experimentCSS, {encoding:"utf-8"})
        }catch(e){css = "";}
        //Get Assets
        try{
            assets = JSON.parse(fs.readFileSync(
                "assets.json", {encoding:"utf-8"}))
        }catch(e){assets = {};}
        //Compile
        css = String(ejs.render(css,{locals:{assets:assets}}));
        //Render CSS
        res.set({"Content-Type": "text/css"});
        res.end(css);
    })
    if(variationFound){

        app.listen(port, function(){
            console.log("Serveing variation at port " + port);
            console.log("Ctrl-c to quit");
        });
    }else{
        console.log("No variation with id or description: \"" + id + "\" found")
    }

}
