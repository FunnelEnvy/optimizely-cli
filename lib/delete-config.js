var fs = require("fs");
var promptly = require('promptly');
module.exports = function(name){
    return promptly.prompt('Delete ".optin/"' + name + '? (y/n)',
    function (err, yes) {
        if(err) throw err;
        if(yes && yes[0].toLowerCase() === "y"){
            if(fs.existsSync(".optin/" + name)){
                fs.unlinkSync(".optin/" + name);
            }
        }
    });
}
