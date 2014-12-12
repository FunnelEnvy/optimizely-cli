var fs = require('fs');
module.exports = function(name, data) {
    fs.writeFileSync(
        name,
        data ? JSON.stringify(data, null, "    ") : ""
    );
    return data;
}
