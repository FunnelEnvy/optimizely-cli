var Table = require('cli-table');
var getExperiments = require("./get-experiments");
module.exports = function(){
    var showExperiments = function(experiments){
        var table = new Table({
            head: ['Id', 'Description']
            , colWidths: [25,25]
        });
        table.push.apply(
            table
            ,experiments.map(
                function(experiment){
                    return [
                    experiment.id,
                    experiment.description
                    ]
                })
            )
        console.log(table.toString())
    }
    return getExperiments(showExperiments);
}
