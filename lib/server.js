var readConfig = require("./read-config");
var fs = require("fs");
var express = require("express");
var opener = require("opener");
var path = require("path");
var lodash = require("lodash");
var ejs = require("ejs");
var fs = require("fs");
var originalPath  = path.join(
    path.dirname(fs.realpathSync(__filename)),
    '../');
var serverTemplate = originalPath + "templates/server";
var scriptTemplate = fs.readFileSync(originalPath + "templates/script.ejs",{encoding:"utf-8"});
module.exports = function(port){
    port = port || 8080;
    var app = express();
    app.set('view engine', 'ejs');
    var experiments = [];
    var buildExperiments;
    experiments = [
        {
            description : "exp 0",
            id : "0",
            variations : [
                {
                    id : "00",
                    jquery :"",
                    name : "var00",
                    namespace : "?",
                    version : "0.1",
                    description : "variation 0-0",
                    author : "",
                    match : "",
                    grant : "",
                    jquery : "",
                    code : "alert(\"00\");"
                },
                {
                    id : "01",
                    jquery :"",
                    name : "var01",
                    namespace : "?",
                    version : "0.1",
                    description : "variation 0-1",
                    author : "",
                    match : "",
                    grant : "",
                    jquery : "",
                    code : "alert(\"01\");"
                },
            ]
        },
        {
            description : "exp 1",
            id : "1",
            variations : [
                {
                    id : "10",
                    jquery : "full",
                    name : "var10",
                    namespace : "?",
                    version : "0.1",
                    description : "variation 1-0",
                    author : "",
                    match : "",
                    grant : "",
                    jquery : "",
                    code : "alert(\"10\");"
                },
                {
                    id : "11",
                    jquery : "lite",
                    name : "var11",
                    namespace : "?",
                    version : "0.1",
                    description : "variation 1-1",
                    author : "",
                    match : "",
                    grant : "",
                    jquery : "",
                    code : "alert(\"11\");"
                }
            ]
        }
    ]
    //Bulid Experiments

    app.get("/", function(req, res){
        res.render(serverTemplate, { experiments : experiments})
    });
    app.get("/:experiment/:variation/script.user.js", function(req, res){
        experiments.forEach(function(experiment){
            if(experiment.id = req.params.experiment){
                experiment.variations.forEach(function(variation){
                    if(variation.id === req.params.variation){
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
            return;
        })
    })
    app.listen(port,function(){
        console.log("Server listening at ", port);
        console.log("Ctrl-c to quit");
        opener("http://localhost:" + port);
    });
}
