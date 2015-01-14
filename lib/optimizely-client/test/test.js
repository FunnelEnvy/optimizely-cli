var OptimizelyClient = require("../lib/OptimizelyClient");
var hat = require("hat")
var assert = require("assert");
var nock = require("nock");
var token = "TEST_TOKEN";

var stripPathEnd = function(path) {
  var index = path.lastIndexOf("/");
  return path.substr(index + 1);
}
var PROJECTID = hat();
var EXPERIMENTID = hat();
var VARIATIONID = hat();
var PROJECTNAME = "PROJECTNAME";
var EXPERIMENTDESCRIPTION = "DESCRIPTION OF EXPERIMENT";
var VARIATIONDESCRIPTION = "DESCRIPTION OF VARIATION";
var baseUrl = 'https://www.optimizelyapis.com/experiment/v1';
var EDITURL = 'https://www.google.com';


////////////////
//Mocs
////////////////
var scope = nock(baseUrl)
  //Project
  .post('/projects/') //create
  .reply(200, function(uri, requestBody) {
    requestBody = JSON.parse(requestBody);
    requestBody.id = PROJECTID;
    return requestBody;
  })
  .get('/projects/' + PROJECTID) //get
  .reply(200, function(uri, requestBody) {
    return stripPathEnd(uri);
  })
  //Experiment
  .post('/projects/' + PROJECTID + "/experiments/") //create
  .reply(200, function(uri, requestBody) {
    requestBody = JSON.parse(requestBody);
    requestBody.id = EXPERIMENTID;
    return requestBody;
  })
  .get('/experiments/' + EXPERIMENTID) //get
  .reply(200, function(uri, requestBody) {
    return stripPathEnd(uri);
  })
  .put('/experiments/' + EXPERIMENTID) //update
  .reply(200, function(uri, requestBody) {
    requestBody.id = stripPathEnd(uri);
    return requestBody;
  })
  .get('/projects/' + PROJECTID + '/experiments/') //get multiple
  .reply(200, function(uri, requestBody) {
    return [{
      "project_id": PROJECTID,
      "description": EXPERIMENTDESCRIPTION
    }];
  })
  .get('/projects/' + PROJECTID + '/experiments/') //get by description
  .reply(200, function(uri, requestBody) {
    return [{
      "project_id": PROJECTID,
      "description": EXPERIMENTDESCRIPTION
    }];
  })
  //Variations
  .post('/experiments/' + EXPERIMENTID + '/variations/') //create
  .reply(200, function(uri, requestBody) {
    requestBody = JSON.parse(requestBody);
    requestBody.id = VARIATIONID;
    return requestBody;
  })
  .get('/variations/' + VARIATIONID) //get
  .reply(200, function(uri, requestBody) {
    return stripPathEnd(uri);
  })
  .put('/variations/' + VARIATIONID) //update
  .reply(200, function(uri, requestBody) {
    requestBody = JSON.parse(requestBody);
    requestBody.id = VARIATIONID;
    return requestBody;
  });

////////////////
//Tests
////////////////
var client = new OptimizelyClient(token);
describe("Successful API Calls", function() {
  describe("Projects", function() {
    it('should create a project', function(done) {
      var options = {
        "name": PROJECTNAME,
        "status": "ACTIVE",
        "ip_filter": "",
        "include_jquery": false
      }
      client.createProject(options)
        .then(
          function(project) {
            project = JSON.parse(project);
            assert.equal(project.id, PROJECTID);
            assert.equal(project.name, PROJECTNAME);
            assert.equal(project.status, "ACTIVE");
            assert.equal(project.include_jquery, false);
            assert.equal(project.ip_filter, "");
            done();
          },
          function(error) {
            done(error);
          }
        )
    });
    it('should retrieve a project', function(done) {
      var options = {
        "id": PROJECTID
      }
      client.getProject(options)
        .then(
          function(id) {
            assert.equal(id, options.id);
            done();
          },
          function(error) {
            done(error);
          }
        )
    });
  })
  describe("Experiments", function() {
    it('should create an experiment', function(done) {
      var options = {
        "project_id": PROJECTID,
        "edit_url": EDITURL,
        "custom_css": "/*css comment*/",
        "custom_js": "//js comment"
      }
      client.createExperiment(options)
        .then(
          function(experiment) {
            experiment = JSON.parse(experiment);
            assert.equal(experiment.id, EXPERIMENTID);
            assert.equal(experiment.edit_url, EDITURL);
            assert.equal(experiment.custom_css, "/*css comment*/");
            assert.equal(experiment.custom_js, "//js comment");
            done();
          },
          function(error) {
            done(error);
          }
        )
    });
    it('should retrieve an experiment', function(done) {
      var options = {
        "id": EXPERIMENTID
      }
      client.getExperiment(EXPERIMENTID)
        .then(
          function(id) {
            assert(id, options.id)
            done();
          },
          function(error) {
            done(error);
          }
        )
    });
    it('should update an experiment', function(done) {
      var options = {
        "id": EXPERIMENTID,
        "description": "New " + EXPERIMENTDESCRIPTION
      };
      client.updateExperiment(options)
        .then(
          function(experiment) {
            experiment = JSON.parse(experiment);
            assert.equal(experiment.description, options.description);
            done();
          },
          function(error) {
            done(error);
          }
        )
    });
    it('should retrieve a list of experiments', function(done) {
      var options = {
        "project_id": PROJECTID
      }
      client.getExperiments(options)
        .then(
          function(experiments) {
            experiments = JSON.parse(experiments);
            assert.equal(experiments[0].project_id, options.project_id);
            done();
          },
          function(error) {
            done(error);
          }
        )
    });
    it('should retrieve an experiment by description', function(done) {
      var options = {
        "project_id": PROJECTID,
        "description": EXPERIMENTDESCRIPTION
      };
      client.getExperimentByDescription(options)
        .then(
          function(experiment) {
            assert.equal(experiment.description,
              options.description);
            done();
          },
          function(error) {
            done(error);
          }
        )
    });
  })
  describe("Variations", function() {
    it('should create a variation', function(done) {
      var options = {
        "experiment_id": EXPERIMENTID,
        "description": "Variation Description"
      }
      client.createVariation(options)
        .then(
          function(variation) {
            variation = JSON.parse(variation);
            assert.equal(variation.description,
              "Variation Description");
            done();
          },
          function(error) {
            done(error);
          }
        )
    });
    it('should retrieve a variation', function(done) {
      client.getVariation(VARIATIONID)
        .then(
          function(id) {
            assert.equal(id, VARIATIONID);
            done();
          },
          function(error) {
            done(error);
          }
        )
    });
    it('should update a variation', function(done) {
      var options = {
        "id": VARIATIONID,
        "description": "New " + "Variation Description"
      }
      client.updateVariation(options)
        .then(
          function(variation) {
            variation = JSON.parse(variation);
            assert.equal(variation.description,
              "New " + "Variation Description");
            done();
          },
          function(error) {
            done(error);
          }
        )
    });
  })



})



describe("Unsuccessful API Calls", function() {
  describe("Projects", function() {
    it('should not if the name is missing', function(done) {

    });
    it('should retrieve a project', function(done) {

    });
  })
  describe("Experiments", function() {

  })
  describe("Variations", function() {

  })
})
