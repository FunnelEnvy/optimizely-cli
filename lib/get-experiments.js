var OptimizelyClient = require('./OptimizelyClient');
var readConfig = require("./read-config");
module.exports = function(fullfillment){
    return readConfig("token")
    .then(function(token){
        return readConfig("project")
        .then(
            function(id){
                return (new OptimizelyClient(token)).getExperiments(id);
            }
        )
        .then(fullfillment);
    })
    .fail(function(error){
        console.log(error)
    })
}
