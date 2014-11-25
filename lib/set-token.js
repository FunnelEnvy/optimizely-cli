var fs = require("fs");
var promptly = require('promptly');
var writeToken = function(token){
    try{
        if(!fs.existsSync(".optin")){
            fs.mkdirSync(".optin")
        };
        fs.writeFileSync(".optin/token", token);
        console.log("token set")
    }catch(e){
        console.log("token set failed")
    }
}
module.exports = function(token){
    if(!token){
        return promptly.prompt('Enter Your Optimizely Token (hidden): ',{
            'trim': true,
            'silent': true
        },function (err, token) {
            if(err) token = undefined;
            return writeToken(token);
        });
    }
    return writeToken(token);
}
