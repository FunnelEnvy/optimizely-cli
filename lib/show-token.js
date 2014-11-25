var getToken = require("./get-token");
var promptly = require("promptly");
module.exports = function(id){
    getToken()
    .then(function(token){
        return promptly.prompt('Show secure token? (y/n)', function (err, yes) {
            if(err) token = undefined;
            if(yes && yes[0].toLowerCase() === "y"){
                console.log(token)
            }
        });
    }).fail(function(error){
        console.log(error)
    })
}
