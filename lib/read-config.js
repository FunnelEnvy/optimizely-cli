var fs = require("fs");
var q = require("q");

module.exports = function(name){
    var d = q.defer();
    try{
        var result = fs.readFileSync(".optcli/" + name, {encoding:"utf-8"});
        d.resolve(result);
    }catch(e){
        switch(name){
            case "token":
            case "project":
                require("./set-" + name + "")()
                .then(function(token){
                    d.resolve(token);
                })
                .fail(function(reason){
                    console.log(name," ","not set")
                    d.reject(reason);
                })
                break;
            default:
                console.log(name," ","not set")
                d.reject(e);
        }
    }
    return d.promise;
}
