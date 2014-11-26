var Table = require('cli-table');
var getVariations = require("./get-variations");
module.exports = function(){
    var showVariations = function(variations){
        var table = new Table({
            head: [ 'Id', 'Experiment','Description']
            , colWidths: [25,25,25]
        });
        table.push.apply(
            table
            ,variations.map(
                function(variation){
                    return [
                    variation.id,
                    variation.experiment_id,
                    variation.description
                    ]
                })
            )
        console.log(table.toString())
    }
    return getVariations(showVariations);
}
