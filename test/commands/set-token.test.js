var fs = require('fs');
var expect = require('chai').expect;
var quickTemp = require('quick-temp');
var setToken = require('../../lib/commands/set-token.js');

var directory = {};
var tokenString = 'abcdefghijklmnop';
var currentDir;

describe('Set Token Command', function(){
  before(function (done){
    //Create temporary project directory 
    quickTemp.makeOrRemake(directory, 'project');
    currentDir = process.cwd();
    process.chdir(directory.project);
    done();
  });
  after(function (done) {
    //Remove the temporary directory
    process.chdir(currentDir);
    quickTemp.remove(directory, 'project');
    done();
  });
  it('Should set the token in the current directory', function(done){
    setToken(tokenString , {});
    fs.readFile(directory.project + '/.optcli/token', function(err, token){
      expect(err).to.be.null;
      expect(String(token)).to.equal(tokenString);
      done();
    });
  });
});