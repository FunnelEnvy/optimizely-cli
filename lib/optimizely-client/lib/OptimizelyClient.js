/**
 * @fileOverview Optimizely Client for Node
 * @name Optimizely Client
 * @author Arun
 * @version 0.0.1
 */

/** @access private */
var Promise = require("bluebird");
var rest = require('restler');

/** @const*/
var methodNamesToPromisify =
  "get post put del head patch json postJson putJson".split(" ");

var EventEmitterPromisifier = function(originalMethod) {
  // return a function
  return function promisified() {
    var args = [].slice.call(arguments);
    // Needed so that the original method can be called with the correct receiver
    var self = this;
    // which returns a promise
    return new Promise(function(resolve, reject) {
      // We call the originalMethod here because if it throws,
      // it will reject the returned promise with the thrown error
      var emitter = originalMethod.apply(self, args);

      emitter
        .on("success", function(data) {
          resolve(data);
        })
        .on("fail", function(data) {
          //Failed Responses including 400 status codes
          reject(data);
        })
        .on("error", function(err) {
          //Internal Error
          reject(err);
        })
        .on("abort", function() {
          reject(new Promise.CancellationError());
        })
        .on("timeout", function() {
          reject(new Promise.TimeoutError());
        });
    });
  };
};

Promise.promisifyAll(rest, {
  filter: function(name) {
    return methodNamesToPromisify.indexOf(name) > -1;
  },
  promisifier: EventEmitterPromisifier
});
////////////////
//0. Constructor
////////////////
/**
 *@public
 *@Constructor
 *@name OptimizelyClient
 *@since 0.0.1
 *@description Optimizely Client Constructor
 *@param {string} apiToken The Optimizely API Token
 *@param {string} [baseUrl="https://www.optimizelyapis.com/experiment/v1/"] The Optimizely API URL
 *@return {OptimizelyClient} The newly created optimizely client.
 *@throws {error} Throws an error if apiToken is not provided
 *@example
 *var apiToken = "*";//Get token from www.optimizely.com/tokens
 *var oc = new OptimizelyClient(API_TOKEN);
 */
var OptimizelyClient = function(apiToken, baseUrl) {
    //initialize
    if (!apiToken) throw new Error("Required: apiToken");
    this.apiToken = String(apiToken);
    this.baseUrl = baseUrl ||
      'https://www.optimizelyapis.com/experiment/v1/';
  }
  ////////////////
  //1. Projects
  ////////////////

/**
 *@pubilc
 *@name OptimizelyClient#createProject
 *@since 0.0.1
 *@description Create a project in Optimizely
 *@param {object} options An object with the following properties:
 *{
 *	@param project_name
 *	@param {string} [status = "Draft|Active"]
 *	@param {boolean} [include_jquery = false]
 *	@param {string} [ip_filter=""]
 *}
 *@returns {promise} A promise fulfilled with the created project
 *@example
 *oc.createProject({
 *project_name:"sample project name",
 *project_status:"Draft",
 *include_jquery:false,
 *ip_filter:""
 *})
 *.then(function(createdProject){
 *    //...do something with created project
 *})
 *.then(null,function(error){
 *    //handle error
 *})
 */
OptimizelyClient.prototype.createProject = function(options) {
    options = options || {};
    options.project_name = options.project_name || "";
    options.status = options.status || "Draft";
    options.include_jquery = !!options.include_jquery;
    //TODO:Check for truthiness
    options.ip_filter = options.ip_filter || "";
    var postUrl = this.baseUrl + 'projects/';
    return rest.postAsync(postUrl, {
      method: 'post',
      headers: {
        'Token': this.apiToken,
        'Content-Type': 'application/json'
      },
      data: JSON.stringify(options)
    })
  }
  /**
   *@pubilc
   *@name OptimizelyClient#getProject
   *@since 0.0.1
   *@description Retrieve a project from Optimizely
   *@param {object} options An object with the following properties:
   *{
   *	@param {string} id
   *}
   *@note the id may be passed as a string instead of a member of an object
   */
OptimizelyClient.prototype.getProject = function(options) {
    if (typeof options === "string" || typeof options === "number") options = {
      id: options
    };
    options = options || {};
    options.id = String(options.id || "");
    if (!options.id) throw new Error("required: options.id");
    var theUrl = this.baseUrl + 'projects/' + options.id;
    return rest.getAsync(theUrl, {
      method: 'get',
      headers: {
        'Token': this.apiToken,
        'Content-Type': 'application/json'
      }
    })
  }
  ////////////////
  //2. Experiments
  ////////////////

/**
 *@pubilc
 *@name OptimizelyClient#createExperiment
 *@since 0.0.1
 *@description create an experiment in Optimizely
 */
OptimizelyClient.prototype.createExperiment = function(options) {
    options = options || {};
    options.description = options.description || "";
    options.project_id = options.project_id || "";
    options.edit_url = options.edit_url || "";
    options.custom_css = options.custom_css || "";
    options.custom_js = options.custom_js || "";
    options.url_conditions = options.url_conditions || [{
      'value': options['edit_url'],
      'match_type': 'simple'
    }];
    if (!options.edit_url) throw new Error("Required: options.edit_url");
    if (!options.project_id) throw new Error("Required: options.project_id");
    var postUrl = this.baseUrl + 'projects/' + options.project_id +
      '/experiments/';
    delete options.project_id;
    return rest.postAsync(postUrl, {
      method: 'post',
      headers: {
        'Token': this.apiToken,
        'Content-Type': 'application/json'
      },
      data: JSON.stringify(options)
    })
  }
  /**
   *@pubilc
   *@name OptimizelyClient#getExperiment
   *@since 0.0.1
   *@description Retrieve an experiment by id/object.id
   *@param {object} options An object with the following properties:
   *{
   *	@param id
   *}
   *@note the id may be passed as a string instead of a member of an object
   */
OptimizelyClient.prototype.getExperiment = function(options) {
    if (typeof options === "string" || typeof options === "number") options = {
      id: options
    };
    options = options || {};
    options.id = String(options.id || "");
    if (!options.id) throw new Error("required: options.id");
    var theUrl = this.baseUrl + 'experiments/' + options.id;
    return rest.getAsync(theUrl, {
      method: 'get',
      headers: {
        'Token': this.apiToken,
        'Content-Type': 'application/json'
      }
    });
  }
  /**
   *@pubilc
   *@name OptimizelyClient#updateExperiment
   *@since 0.0.1
   *@description Retrieve an experiment by id/object.id
   *@param {object} options An object with the following properties:
   *{
   *	@param id
   *	@param {string} [status = "Draft|Active"]
   *	@param {boolean} [include_jquery = false]
   *	@param {string} [ip_filter=""]
   *}
   */
OptimizelyClient.prototype.updateExperiment = function(options) {
    options = options || {};
    options.id = String(options.id || "");
    options.description = options.description || "";
    options.edit_url = options.edit_url || "";
    options.custom_css = options.custom_css || "";
    options.custom_js = options.custom_js || "";
    if (!options.id) throw new Error("required: options.id");
    var theUrl = this.baseUrl + 'experiments/' + options.id;
    delete options.id
    return rest.putAsync(theUrl, {
      method: 'put',
      headers: {
        'Token': this.apiToken,
        'Content-Type': 'application/json'
      },
      data: JSON.stringify(options)
    })
  }
  /**
   *@pubilc
   *@name OptimizelyClient#getExperiments
   *@since 0.0.1
   *@description Retrieve all experiments associatd with a given project
   *@param {object} options An object with the following properties:
   *{
   *	@param {string} project_id
   *}
   *@note the id may be passed as a string instead of a member of an object
   */
OptimizelyClient.prototype.getExperiments = function(options) {
  if (typeof options === "string" || typeof options === "number") options = {
    project_id: options
  };
  options = options || {};
  options.project_id = String(options.project_id || "");
  if (!options.project_id) throw new Error("required: options.project_id");
  var theUrl = this.baseUrl + 'projects/' + options.project_id +
    '/experiments/';
  return rest.getAsync(theUrl, {
    method: 'get',
    headers: {
      'Token': this.apiToken,
      'Content-Type': 'application/json'
    }
  })
}

/**
 *@pubilc
 *@name OptimizelyClient#updateExperimentByDescription
 *@since 0.0.1
 *@description Get an experiment description
 *@param {object} options An object with the following properties:
 *{
 *	@param project_name
 *	@param {string} [status = "Draft|Active"]
 *	@param {boolean} [include_jquery = false]
 *	@param {string} [ip_filter=""]
 *}
 */
OptimizelyClient.prototype.getExperimentByDescription = function(options) {
  if (typeof options === "string") options = {
    project_id: options
  };
  options = options || {};
  options.project_id = String(options.project_id || "");
  options.description = options.description || arguments[1];
  if (!options.project_id) throw new Error("Required: options.project_id");
  if (!options.description) throw new Error("Required: options.description");
  return this.getExperiments(options.project_id).then(function(data) {
    if (typeof data === "string") data = JSON.parse(data);
    for (var i in data) {
      if (data[i]['description'] ===
        options.description) {
        return data[i];
      };
    }
    return null;
  })
}

////////////////
//3. Variations
////////////////
/**
 *@pubilc
 *@name OptimizelyClient#createVariation
 *@since 0.0.1
 *@description create an experiment in Optimizely
 *@param {object} options An object with the following properties:
 *{
 *	@param {string|number} experiment_id
 *	@param {string} [descriptions = ""]
 *}
 */
OptimizelyClient.prototype.createVariation = function(options) {
    options = options || {};
    options.experiment_id = String(options.experiment_id || "");
    options.description = options.description || "";
    if (!options.experiment_id) throw new Error(
      "Required: options.experiment_id");
    var postUrl = this.baseUrl + 'experiments/' + options.experiment_id +
      '/variations/';
    delete options.experiment_id;
    return rest.postAsync(postUrl, {
      method: 'post',
      headers: {
        'Token': this.apiToken,
        'Content-Type': 'application/json'
      },
      data: JSON.stringify(options)
    })
  }
  /**
   *@pubilc
   *@name OptimizelyClient#getVariation
   *@since 0.0.1
   *@description create an experiment in Optimizely
   *@param {object} options An object with the following properties:
   *{
   *	@param {string|number} id
   *}
   */
OptimizelyClient.prototype.getVariation = function(options) {
  if (typeof options === "string") options = {
    id: options
  };
  if (!options.id) throw new Error("Required: options.id");
  var theUrl = this.baseUrl + 'variations/' + options.id;
  return rest.getAsync(theUrl, {
    method: 'get',
    headers: {
      'Token': this.apiToken,
      'Content-Type': 'application/json'
    }
  })
}

/**
 *@pubilc
 *@name OptimizelyClient#updateVariation
 *@since 0.0.1
 *@description Update a variation in Optimizely
 *@param {object} options An object with the following properties:
 *{
 *	@param {string|number} id
 *	@param {string} [description]
 *}
 */
OptimizelyClient.prototype.updateVariation = function(options) {
  options = options || {};
  options.id = options.id || "";
  options.description = options.description || "";
  options.js_component = options.js_component || "";
  if (!options.id) throw new Error(
    "Required: options.id");
  var theUrl = this.baseUrl + 'variations/' + options.id;
  delete options.id;
  return rest.putAsync(theUrl, {
    method: 'put',
    headers: {
      'Token': this.apiToken,
      'Content-Type': 'application/json'
    },
    data: JSON.stringify(options)
  })
}
module.exports = OptimizelyClient;
