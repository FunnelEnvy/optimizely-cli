var OptimizelyClient = require('./OptimizelyClient');
var setToken = require("./set-token");
var setProject = require("./set-project");
module.exports = function(name, archive, jquery, ip){
    return setToken()
    .then(function(token){
        return (new OptimizelyClient(token))
        .createProject(
            name,
            archive,
            jquery,
            ip)
        .then(function(proj){
            return setProject(proj.id);
        });
    })
    .then(function(result){
        console.log(result);
    }).fail(function(error){
        console.log(error)
    })
}
