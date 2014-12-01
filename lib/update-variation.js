var readConfig = require("./read-config");
var fs = require("fs");
var OptimizelyClient = require('./OptimizelyClient');
var glob = require("glob");
module.exports = function(id){
    var files = glob.sync("**/variation.json");
    files.forEach(function(file){
        var variation = JSON.parse(fs.readFileSync(file,{encoding:"utf-8"}));
        if(String(variation.variation_id) === id){
            file = file.substr(0,
                file.length - ("variation.json".length));
            var js_component =
                fs.readFileSync(
                    file +
                    "js_component.js",{encoding:"utf-8"}
                );
            return readConfig("token")
            .then(function(token){
                return (new OptimizelyClient(token))
                .updateVariation(
                    variation.variation_id,
                    {
                        js_component : js_component,
                        description : variation.description
                    }
                ).then(function(variation){
                    console.log("success");
                })
            }).fail(function(e){
                console.log(e)
            })
        }
    })
}
