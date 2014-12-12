var fs = require('fs');
module.exports = function(name) {
    try {
        fs.mkdirSync(name);
    } catch (e) {}
}
