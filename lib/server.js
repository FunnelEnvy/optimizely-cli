var readConfig = require("./read-config");
var fs = require("fs");
var express = require("express");
var opener = require("opener");

module.exports = function(port){
    port = port || 8080;
    var app = express();
    app.get("/", function(req, res){
        res.send("ready");
    });
    app.listen(port,function(){
        console.log("Server listening at ", port);
        console.log("Ctrl-c to quit");
        opener("http://localhost:8080");
    });
}
