var readConfig = require("./read-config");
var promptly = require("promptly");
module.exports = function(id){
    readConfig("token")
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
