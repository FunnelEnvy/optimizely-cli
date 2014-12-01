var readConfig = require("./read-config");
var fs = require("fs");
var glob = require("glob");
var opener = require("opener")
module.exports = function(id){
    var files = glob.sync("**/variation.json");
    files.forEach(function(file){
        var variation = JSON.parse(fs.readFileSync(file,{encoding:"utf-8"}));
        if(String(variation.variation_id) === id){
            opener(file.substr(0,
                file.length - ("variation.json".length)));
        }
    })
}
