var path = require('path');
var assert = require('chai').assert;
var utils = require('../lib/utils');

suite('Utils', function () {
  test('show a file flagged as a module file if it is a module file', function (done) {
      var moduleFileBlankStr = '';
      var moduleFileStr = '// inject';
      var moduleFileStrOpt2 = '/* inject */'
      var coffeescriptModuleFileStr = '# inject';
      
      assert.isNull(utils.isModuleFile(moduleFileBlankStr), 'blank file is not a module file.');
      assert.isNotNull(utils.isModuleFile(moduleFileStr), 'file that starts with "// inject" is module file');
      assert.isNotNull(utils.isModuleFile(moduleFileStrOpt2), 'file that starts with "/* inject */"" is module file');
      assert.isNotNull(utils.isModuleFile(coffeescriptModuleFileStr), 'coffeescript file that starts with "# inject is" module file');
      done();
  });
  
  test('parses the arguments of the module', function (done) {
    var noArgsModule = 'function () {}';
    var argsModule = 'function (SomeArg, AnotherArg) {}';
    
    assert.deepEqual(utils.processArgs(noArgsModule), [], 'no arguments returns blank array');
    assert.deepEqual(utils.processArgs(argsModule), ['SomeArg', 'AnotherArg'], 'parses arguments into array');
    done();
  });
  
  test('trims whitespace from arguments list', function (done) {
      var modSpace = function ( spaceArg ) {};
      
      assert.deepEqual(utils.processArgs(modSpace), ['spaceArg'], 'trimmed whitespace in array items');
      done();
  });
  
  test('returns imaginary dependency when dependency does not exist for module', function(done) {
      assert.isNull(utils.imaginaryDependency(), 'null is imaginary');
      done();
  });
});