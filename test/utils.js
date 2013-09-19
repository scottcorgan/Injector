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
});