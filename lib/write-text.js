var fs = require('fs');
module.exports = function(name, data) {
    fs.writeFileSync(
        name,
        data || ""
    );
    return data;
}
