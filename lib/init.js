var fs = require("fs");
var promptly = require('promptly');
module.exports = function(local){
    return promptly.prompt('Delete Token? (y/n)', function (err, yes) {
        if(err) token = undefined;
        if(yes && yes[0].toLowerCase() === "y"){
            if(fs.existsSync(".optin/token")){
                fs.unlinkSync(".optin/token");
            }
        }
    });
}
