var q = require("q");
var writeConfig = require("./write-config");
var fs = require("fs")
q.die = function(reason){
    var d = q.defer();
    d.reject(reason);
    return d.promise;
}
module.exports = function(name, value){
    try{
        if(!fs.existsSync(".optcli")){
            fs.mkdirSync(".optcli")
        };
        fs.writeFileSync(".optcli/" + name, value);
        return q(value);
    }catch(e){
        return q.die(e);
    }
}
