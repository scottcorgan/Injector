var path = require('path');
var fs = require('fs');
var assert = require('chai').assert;
var Injector = require('../index');
var modulesHelper = require('./helpers/modules');
var _mockData = require('fs');
var utils = require('../lib/utils');

suite('Mocking modules', function() {
  var injector;
  
  setup(function (done) {
    modulesHelper.setUpModules();
    
    // With mocks
    Injector.create('Mocking modules', {
      directory: modulesHelper.moduleDir,
      mock: {
        ModuleName: function (fs) {
          return function () {
            return fs;
          }
        },
        StringModule: function (ModuleName) {
          return ModuleName();
        },
        path: 'path',
        async: 'async'
      }
    }, function (err, _injector) {
      injector = _injector
      done();
    });
  });
  
  teardown(function (done) {
    modulesHelper.tearDownModules();
    injector = null;
    done();
  });
  
  test('should replace the module definition with the mocked definition', function () {
    var module = injector.inject('ModuleName');
    assert.isFunction(module, 'module has been mocked');
  });
  
  test('should return imaginary dependency for mock that does not exist', function () {
    var module = injector.inject('someModule');
    assert.equal(module, utils.imaginaryDependency(), 'non existen module returns null');
  });
  
  test('should parse and bootstrap dependencies in the mocked version', function () {
    var module = injector.inject('ModuleName');
    var moduleDef = injector.getModule('ModuleName');
    var stringModule = injector.inject('StringModule');
    
    assert.deepEqual(['fs'], moduleDef.dependsOn, 'has correct dependecies list');
    assert.equal(module(), _mockData, 'module returned mocked data');
    assert.deepEqual(stringModule, fs, 'mocked dependencies are injected');
  });
  
  test('should inject mocked npm and core module if defined', function () {
    var path = injector.inject('path');
    var async = injector.inject('async');
    
    assert.equal(path, 'path', 'mock core module');
    assert.equal(async, 'async', 'mock npm module');
  });
});