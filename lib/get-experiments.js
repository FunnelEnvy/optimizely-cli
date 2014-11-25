var OptimizelyClient = require('./OptimizelyClient');
var getToken = require("./get-token");
module.exports = function(id){
    getToken()
    .then(function(token){
        return (new OptimizelyClient(token)).getExperiments(id);
    })
    .then(function(result){
        console.log(result);
    }).fail(function(error){
        console.log(error)
    })
}
