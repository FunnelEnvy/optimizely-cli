var fs = require("fs");
var q = require("q");
module.exports = function(){
    var d = q.defer();
    try{
        var result = fs.readFileSync(".optin/token", {encoding:"utf-8"});
        d.resolve(result);
    }catch(e){
        console.log("run 'optin set-token'")
        d.reject("");
        process.exit();
    }
    return d.promise;
}
