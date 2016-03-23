var setToken = require('../set-token.js');
var logger = require('../logger.js');

/**
 * Sets the optimizely API token in the 
 * current project folder. 
 * @param  {String}   token     Optimizely API token
 */
module.exports = function(token){
  setToken(token).then(function(){
    logger.log('info', 'token successfully set');
  }).catch(function(err){
    logger.log('error', err.message);
  });
};