var fs = require('fs');
module.exports = function(experiment, directory){
    var dirname =
    (directory || "") +
    (experiment.id) + "/";
    fs.mkdirSync(dirname);
    fs.writeFileSync(
        dirname +
        "global.css",
        experiment.custom_css);
    fs.writeFileSync(
        dirname +
        "global.js",
        experiment.custom_js);
    delete experiment.custom_css;
    delete experiment.custom_js;
    fs.writeFileSync(
        dirname +
        "experiment.json",
        experiment? JSON.stringify(experiment , null, "    ") : ""
    );
}
