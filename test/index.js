var fs = require('fs');
var path = require('path');
var assert = require('chai').assert;
var Injector = require('../index');
var modulesHelper = require('./helpers/modules');

suite('Injector instantiation setup', function() {
    
    test('sets a default module directory', function(done) {
        var injector = new Injector();
        
        assert.isArray(injector.modulesDirectory, 'included directories list should be an array');
        assert.deepEqual(injector.modulesDirectory, ['./'], 'sets empty directory argument to current directory');        
        done();
    });
    
    test('sets multiple module directories', function(done) {
        var moduleMultiDir = ['moduleDir1', 'moduleDir2'];
        var injector = new Injector('', {
            directory: moduleMultiDir
        });
        
        assert.equal(injector.modulesDirectory, moduleMultiDir, 'can set multiple module directories');
        done();
    });
    
    test('sets a single module directory', function (done) {
        var moduleMultiDir = 'moduleDir1';
        var injector = new Injector('', {
            directory: moduleMultiDir
        });
        
        assert.deepEqual(injector.modulesDirectory, [moduleMultiDir], 'can set a single module directory');
        done();
    });
    
    test('sets a default for excluded directories', function(done) {
        var injector = new Injector();
        
        assert.isArray(injector.excludeFolders, 'excluded directories list should be an array');
        assert.deepEqual(injector.excludeFolders, [], 'can set the default excluded directories to empty array');
        done();
    });
    
    test('sets the excluded directories', function (done) {
        var excludeModuleMultiDir = ['moduleDir1', 'moduleDir2'];
        var injector = new Injector('', {
            exclude: excludeModuleMultiDir
        });
        
        assert.equal(injector.excludeFolders, excludeModuleMultiDir, 'can set excluded directories');
        done();
    });
    
    test('does not allow node_modules directory to have modules', function (done) {
        var inject = function () {
            new Injector('', {
                directory: ['node_modules']
            });
        };
        
        assert.throw(inject, Error, 'Cannot put Injector modules in the node_modules directory');
        done();
    });
    
    test('does not accept a function as a directory', function (done) {
        var inject = function () {
            new Injector('AppName', {directory: function () {}});
        }
        
        assert.throw(inject, Error);
        done();
    });
    
    test('does not accept an object as a directory', function (done) {
        var inject = function () {
            new Injector('AppName', {directory: {}});
        }
        
        assert.throw(inject, Error);
        done();
    });
    
    //
    // need to test that directories get excluded
    //
    
});

suite('Injector static methods', function() {
    
    setup(function(){
        modulesHelper.setUpModules();
    });

    teardown(function(){
        modulesHelper.tearDownModules();
    });
    
    test('create an instance of Injector', function (done) {        
        Injector.create('TestApp', {
            directory: [modulesHelper.moduleDir]
        }, function (err, injector) {
            assert.ok(injector instanceof Injector, 'instantiates an instance of Injector');
            done();
        });
    });
});

suite('Injector instance', function() {
    var injector;
    
    setup(function(done){
        modulesHelper.setUpModules();
        
        injector = new Injector('TestApp', {
            directory: [modulesHelper.moduleDir]
        });
        
        done();
    });

    teardown(function(done){
        modulesHelper.tearDownModules();
        done();
    });

    test('can bootstrap our set of modules', function(done) {
        injector.bootstrap(function (err, modules) {
            assert.isObject(modules, 'creates an object of modules and instantiated Injector')
            assert.property(modules, modulesHelper.moduleName, 'bootstraps all the modules in the directory');
            done();
        });
    });
    
    test('collects modules in the specified directory', function(done) {
        injector.collectModules(function (err, modules) {
            var hasModule = false;
            
            assert.isArray(modules, 'collects modules into an array');
            assert.isObject(modules[0], 'collects an array of objects');
            assert.equal(Object.keys(modules[0])[0], modulesHelper.moduleName, 'adds our module to the array of modules');
            done();
        });
    });
    
    test('gets a module with a getter', function (done) {
        injector.bootstrap(function (err, modules) {
            var module = injector.getModule(modulesHelper.moduleName);
            
            assert.isObject(module, 'module is an object');
            assert.equal(module.name, modulesHelper.moduleName, 'module has the correct name');
            done();
        });
    });
    
    test('registers modules', function (done) {
        var registerModule = function () {
            return injector.register({
                name: modulesHelper.moduleName,
                val: 'module value',
                dependsOn: []
            });
        };
        
        var module = registerModule();
        assert.property(injector.modules, modulesHelper.moduleName, 'registered our module on the instance');
        assert.throw(registerModule, Error, '', 'throws an error when duplicate modules are registered');
        assert.property(injector.modules[modulesHelper.moduleName], 'bootstrapped', 'declares our module to be bootstrapped or not bootstrapped');
        done();
    });
    
    test('registers a module as an object', function(done) {
        injector.bootstrap(function (err, modules) {
            var module = modules[modulesHelper.objectModuleName];
            
            assert.isObject(module.bootstrapped, 'registers an object module');
            done();
        });
    });
    
    test('registers a module as a string or number', function(done) {
        injector.bootstrap(function (err, modules) {
            var module = modules[modulesHelper.stringModuleName];
            
            assert.isString(module.bootstrapped, 'registers a module as a string');
            done();
        });
    });
    
    
    test('resolves dependency of a module', function(done) {
        injector.bootstrap(function (err, modules) {
            var deps = injector.resolveDependencies([modulesHelper.moduleName]);
            
            assert.isArray(deps, 'returns array of bootstrapped values of dependencies');
            assert.deepEqual(deps, [modulesHelper.moduleReturn], 'returns dependency values');
            done();
        });
    });
    
    test('parses our module and bootstraps it', function (done) {
        var moduleValue = 'module value';
        var registerModule = function (name, depName) {
            return injector.register({
                name: name,
                definition: moduleValue,
                dependsOn: [depName]
            });
        };
        
        var module = injector.parse(registerModule(modulesHelper.moduleName));
        assert.equal(module.bootstrapped, moduleValue, 'bootstraps the returning value of our module');
        done();
    });
    
    test('registers a module with a syntax sugary method', function(done) {
        injector.module(modulesHelper.moduleName, 'val');
        assert.isDefined(injector.getModule(modulesHelper.moduleName), 'registers the module with the helper function');
        done();
    });
});

suite('Injected modules', function () {
    var injector;
    
    setup(function(done){
        modulesHelper.setUpModules();
        
        injector = new Injector('TestApp', {
            directory: [modulesHelper.moduleDir]
        });
        
        done();
    });

    teardown(function(done){
        modulesHelper.tearDownModules();
        done();
    });
    
    test('returns imaginary dependency when dependency does not exist for module', function(done) {
        assert.deepEqual(injector.resolveDependencies(['notAModule']), [null], 'null for no module and/or dependency');
        done();
    });
    
    test('resolves npm modules', function (done) {
        injector.bootstrap(function (err, modules) {
            var deps = injector.resolveDependencies(['async']);
            var async = require('async');
            
            assert.deepEqual(deps[0], async, 'resolves npm module as injectable module');
            done();
        });
    });
    
    test('provides a default INJECT method to resolve npm and core modules', function (done) {
        var moduleValue = 'moduleValue';
        
        injector.module('moduleToInject', moduleValue);
        injector.module('testInjectModule', function (inject) {
            assert.isFunction(inject, 'inject is a function');
            
            var fs = inject('fs');
            var requireFs = require('fs');
            assert.deepEqual(fs, requireFs, 'injected node core module');
            
            var injectedModule = inject('moduleToInject');
            assert.equal(injectedModule, moduleValue, 'injected an injector module');
            
            var nullModule = inject('nothing');
            assert.isNull(nullModule, 'module is null if it does not exist');
            
            done();
        });
        
        injector.bootstrap();
    });
    
    test('resolves dependencies defined by "inject" for the module', function (done) {
        var moduleValue = 'moduleValue';
        
        injector.module('testInjectModule', function (inject) {
            var injectedModule = inject('moduleToInject');
            assert.equal(injectedModule, moduleValue, 'injected an injector module');
            done();
        });
        
        injector.module('moduleToInject', moduleValue);
        injector.bootstrap(); 
    });
    
    test('can manully inject module from the instance variable', function (done) {
        injector.bootstrap(function () {
            var injectedModule = injector.inject(modulesHelper.moduleName);
            assert.ok(injectedModule);
            assert.equal(injectedModule, modulesHelper.moduleReturn, 'injects the module');
            done();
        });
    });
});

