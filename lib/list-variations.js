var Table = require('cli-table');
var getVariations = require("./get-variations");
module.exports = function(){
    var showVariations = function(variations){
        var table = new Table({
            head: ['Id']
            , colWidths: [25]
        });
        table.push.apply(
            table
            ,variations.map(
                function(variation){
                    return [
                    variation.experiment_id +
                    " " +
                    variation.id
                    ]
                })
            )
        console.log(table.toString())
    }
    return getVariations(showVariations);
}
