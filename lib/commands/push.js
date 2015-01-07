var readConfig = require("../read-config");
var OptimizelyClient = require('../client/OptimizelyClient');

var fs = require("fs");
var express = require("express");
var opener = require("opener");
var path = require("path");
var lodash = require("lodash");
var ejs = require("ejs");
var fs = require("fs");
var glob = require("glob");

var client;
var originalPath = path.join(
  path.dirname(fs.realpathSync(__filename)),
  '../../');
var installTemplate = fs.readFileSync(
  originalPath + "templates/install.user.js.ejs", {
    encoding: "utf-8"
  });
var experimentJSON;
var project;
var experiment;
var assets;
//Get Project
try {
  project = JSON.parse(
    fs.readFileSync("project.json", {
      encoding: "utf-8"
    }));
} catch (e) {
  project = {};
}
var createVariations = function(var_ids) {
  var_ids.forEach(function(id) {
    for (var i = 0; i < experimentJSON.variation_ids.length; i++) {
      if (id === experimentJSON.variation_ids[i]) {
        experimentJSON.variation_ids.splice(i, 1)
        break;
      }
    }
    var variationFound = false;
    glob.sync(experimentJSON._dir + "/**/variation.json").forEach(
      function(dir) {
        if (variationFound) return;
        dir = dir.substr(0, dir.length - ("variation.json".length));
        var variationJSON = dir + "variation.json";
        var variationJS = dir + "variation.js";
        //Parse Experiment JSON File
        try {
          variationJSON = JSON.parse(fs.readFileSync(variationJSON));
        } catch (e) {
          variationJSON = {};
          return;
        }
        if (variationJSON.description !== id && String(
            variationJSON.id) !==
          id) return;
        variationFound = true;
        //Parse + Compile Experiment JS File
        try {
          variationJS = String(ejs.render(fs.readFileSync(
            variationJS, {
              encoding: "utf-8"
            }), {
            locals: {
              assets: assets
            }
          }));
        } catch (error) {
          console.log(error)
          variationJS = "";
        }
        variationJSON.js_component = variationJS;
        var populateVariation = function(variation) {
          console.log("Updating Variation:", variationJSON.description,
            "...");
          return client.updateVariation(variation.id,
            variationJSON).then(
            function(variation) {



              var exp = JSON.parse(fs.readFileSync(experimentJSON._dir +
                "experiment.json", {
                  encoding: "utf-8"
                }));
              exp.variation_ids.push(variation.id);
              fs.writeFileSync(experimentJSON._dir +
                "experiment.json",
                JSON.stringify(exp)
              );
            },
            function(error) {
              console.log(error)
            })
        }


        client.getVariationB(variationJSON.id).then(
          function(variation) {
            populateVariation(variation);
          },
          function() {
            console.log("Creating Variation:", variationJSON.description,
              "...");
            return client.createVariationB(experimentJSON.id,
              variationJSON.description).then(function(
              variation) {
              variationJSON.id = variation.id;
              fs.writeFileSync(experimentJSON._dir + "/" +
                variationJSON.description + "/" +
                "variation.js",
                variationJSON.js_component);
              delete variationJSON.js_component;
              fs.writeFileSync(experimentJSON._dir + "/" +
                variationJSON.description + "/" +
                "variation.json",
                JSON.stringify(variationJSON));
              populateVariation(variation);
            }, function(error) {
              console.log(error)
            });
          }
        )

      })
  })
}
module.exports = function(exp_id, var_ids) {
  var experimentCSS;
  var experimentJS;
  var experimentFound = false;
  var assets;

  glob.sync("**/experiment.json").forEach(function(dir) {
    if (experimentFound) return;
    dir = dir.substr(0, dir.length - ("experiment.json".length));
    experimentJSON = dir + "experiment.json";
    var experimentCSS = dir + "global.css";
    var experimentJS = dir + "global.js";
    //Parse Experiment JSON File
    try {
      experimentJSON = JSON.parse(fs.readFileSync(experimentJSON, {
        encoding: "utf-8"
      }));
    } catch (e) {
      experimentJSON = {};
      return;
    }
    //Continue iff the given experiment matches proper description or id
    if (experimentJSON.description !== exp_id && String(experimentJSON.id) !==
      exp_id) return;
    experimentFound = true;
    //Parse Assets.json File
    try {
      assets = JSON.parse(fs.readFileSync(
        "assets.json", {
          encoding: "utf-8"
        }))
    } catch (e) {
      assets = {};
    }

    //Parse + Compile Experiment CSS File
    try {
      experimentCSS = String(ejs.render(fs.readFileSync(experimentCSS), {
        locals: {
          assets: assets
        }
      }));
    } catch (e) {
      experimentCSS = "";
    }
    //Parse + Compile Experiment JS File
    try {
      experimentJS = String(ejs.render(fs.readFileSync(experimentJS), {
        locals: {
          assets: assets
        }
      }));
    } catch (e) {
      experimentJS = "";
    }
    experimentJSON.custom_css = experimentCSS;
    experimentJSON.custom_js = experimentJS;
    experimentJSON._dir = dir;

    var populateExperiment = function(experiment) {
      console.log("Updating Experiment:", experiment.description,
        "...");
      return client.updateExperiment(experiment.id, experiment).then(
        function() {
          var candidates = [];
          if (var_ids && var_ids.length) {
            candidates = var_ids;
          } else {
            candidates = experimentJSON.variation_ids;
          }
          createVariations(candidates);
        })
    }

    readConfig("token").then(function(token) {
      client = new OptimizelyClient(token);
      client.getExperiment(experimentJSON.id).then(
        function(experiment) {
          populateExperiment(experiment);
        },
        function(error) {
          console.log("Creating Experiment:", experimentJSON.description,
            "...");
          return client.createExperimentC(project.id,
            experimentJSON).then(function(experiment) {
            fs.writeFileSync(experimentJSON._dir + "global.js",
              experiment.custom_js);
            delete experiment.custom_js;
            fs.writeFileSync(experimentJSON._dir + "global.css",
              experiment.custom_css);
            delete experiment.custom_css;
            fs.writeFileSync(experimentJSON._dir +
              "experiment.json", JSON.stringify(
                experiment));
            populateExperiment(experiment);
          });
        }
      )
    })
  })
}
