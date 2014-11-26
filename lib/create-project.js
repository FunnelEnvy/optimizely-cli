var OptimizelyClient = require('./OptimizelyClient');
var setToken = require("./set-token");
module.exports = function(name, archive, jquery, ip){
    return setToken()
    .then(function(token){
        /*
        return (new OptimizelyClient(token))
        .createProject(
            name,
            archive,
            jquery,
            ip)
        .then(function(proj){

        });
        */
    })
    .then(function(result){
        console.log(result);
    }).fail(function(error){
        console.log(error)
    })
}
