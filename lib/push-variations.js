var readConfig = require("./read-config");
var fs = require("fs");
var path = require("path");
var OptimizelyClient = require('./OptimizelyClient');
var getDirectoryNames = function(top, before){
    if(before) top = before  + "/" + top;
    return fs.readdirSync(top || '.')
    .filter(function (file) {
        try{
            return fs.statSync(file).isDirectory();
        }catch(e){
            return false;
        }

    })
}
module.exports = function(path){
        var js_component = fs.readFileSync(process.cwd() + "/" + path + "/" + "variation.js",{encoding:"utf-8"} );
        var variation = JSON.parse(fs.readFileSync(process.cwd() + "/" + path + "/" + "variation.js" ));

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
                console.log("success")
            })
        }).fail(function(e){
            console.log(e)
        })

}
