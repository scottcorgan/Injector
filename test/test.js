var fs = require('fs');
var path = require('path');
var assert = require('chai').assert;
var Injector = require('../index');

var moduleDir = path.join(__dirname, 'modules');
var moduleFilename = 'module1.js';
var moduleFile = path.join(__dirname, 'modules', moduleFilename);
var moduleName = 'ModuleName';
var moduleReturn = 1;
var objectModuleName = 'ObjectModule';
var stringModuleName = 'StringModule';


suite('Injector instantiation setup', function() {
    
    test('sets a default module directory', function(done) {
        var injector = new Injector();
        
        assert.isArray(injector.modulesDirectory, 'included directories list should be an array');
        assert.deepEqual(injector.modulesDirectory, ['./'], 'sets empty directory argument to current directory');        
        done();
    });
    
    test('sets the module directories', function(done) {
        var moduleMultiDir = ['moduleDir1', 'moduleDir2'];
        var injector = new Injector('', {
            directory: moduleMultiDir
        });
        
        assert.equal(injector.modulesDirectory, moduleMultiDir, 'can set multiple module directories');
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
    
    test('initializes empty set of modules', function(done) {
        var injector = new Injector();
        
        assert.isObject(injector.modules, 'modules should be an object');
        assert.deepEqual(injector.modules, {}, 'set the modules object to empty');
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
    
    //
    // need to test that directories get excluded
    //
    
});

suite('Injector static methods', function() {
    
    setup(function(){
        setUpModules();
    });

    teardown(function(){
        tearDownModules();
    });
    
    test('show a file flagged as a module file if it is a module file', function (done) {
        var moduleFileBlankStr = '';
        var moduleFileStr = '// inject';
        
        assert.isNull(Injector.isModuleFile(moduleFileBlankStr), 'blank file is not a module file.');
        assert.isNotNull(Injector.isModuleFile(moduleFileStr), 'file that starts with // inject is module file');
        done();
    });
    
    test('process arguments of a module', function(done) {
        var noArgsModule = 'function () {}';
        var argsModule = 'function (SomeArg) {}';
        
        assert.deepEqual(Injector.processArgs(noArgsModule), [], 'no arguments returns blank array');
        assert.deepEqual(Injector.processArgs(argsModule), ['SomeArg'], 'parses arguments into array');
        done();
    });
    
    test('trims whitespace from arguments list', function (done) {
        var modSpace = function ( spaceArg ) {};
        
        assert.deepEqual(Injector.processArgs(modSpace), ['spaceArg'], 'trimmed whitespace in array items');
        done();
    });
    
    test('makes imaginary dependency', function (done) {
        assert.isNull(Injector.imaginaryDependency(), 'imaginary dependency returns null');
        done();
    });
    
    test('create an instance of Injector', function (done) {        
        Injector.create('TestApp', {
            directory: [moduleDir]
        }, function (err, injector) {
            assert.ok(injector instanceof Injector, 'instantiates an instance of Injector');
            done();
        });
    });
});

suite('Injector instance', function() {
    var injector;
    
    setup(function(done){
        setUpModules();
        
        injector = new Injector('TestApp', {
            directory: [moduleDir]
        });
        
        done();
    });

    teardown(function(done){
        tearDownModules();
        done();
    });

    test('can bootstrap our set of modules', function(done) {
        injector.bootstrap(function (err, modules) {
            assert.isObject(modules, 'creates an object of modules and instantiated Injector')
            assert.property(modules, moduleName, 'bootstraps all the modules in the directory');
            done();
        });
    });
    
    test('collects modules in the specified directory', function(done) {
        injector.collectModules(function (err, modules) {
            assert.isArray(modules, 'collects modules into an array');
            assert.isObject(modules[0], 'collects an array of objects');
            assert.equal(Object.keys(modules[0])[0], moduleName, 'adds our module to the array of modules');
            done();
        });
    });
    
    test('gets a module with a getter', function (done) {
        injector.bootstrap(function (err, modules) {
            var module = injector.getModule(moduleName);
            
            assert.isObject(module, 'module is an object');
            assert.equal(module.name, moduleName, 'module has the correct name');
            done();
        });
    });
    
    test('registers modules', function (done) {
        var registerModule = function () {
            return injector.register({
                name: moduleName,
                val: 'module value',
                dependsOn: []
            });
        };
        
        var module = registerModule();
        assert.property(injector.modules, moduleName, 'registered our module on the instance');
        assert.throw(registerModule, Error, '', 'throws an error when duplicate modules are registered');
        assert.property(injector.modules[moduleName], 'bootstrapped', 'declares our module to be bootstrapped or not bootstrapped');
        done();
    });
    
    test('registers a module as an object', function(done) {
        injector.bootstrap(function (err, modules) {
            var module = modules[objectModuleName];
            
            assert.isObject(module.bootstrapped, 'registers an object module');
            done();
        });
    });
    
    test('registers a module as a string or number', function(done) {
        injector.bootstrap(function (err, modules) {
            var module = modules[stringModuleName];
            
            assert.isString(module.bootstrapped, 'registers a module as a string');
            done();
        });
    });
    
    test('resolves dependency of a module', function(done) {
        injector.bootstrap(function (err, modules) {
            var deps = injector.resolveDependencies([moduleName]);
            
            assert.isArray(deps, 'returns array of bootstrapped values of dependencies');
            assert.deepEqual(deps, [moduleReturn], 'returns dependency values');
            done();
        });
        
    });
    
    test('returns imaginary dependency when dependency does not exist for module', function(done) {
        assert.deepEqual(injector.resolveDependencies(['notAModule']), [null], 'null for no module and/or dependency');
        done();
    });
    
    test('parses our module and bootstraps it', function (done) {
        var moduleValue = 'module value';
        var registerModule = function (name, depName) {
            return injector.register({
                name: name,
                val: moduleValue,
                dependsOn: [depName]
            });
        };
        
        var module = injector.parse(registerModule(moduleName));
        assert.equal(module.bootstrapped, moduleValue, 'bootstraps the returning value of our module');
        done();
    });
    
    test('registers a module with a syntax sugary method', function(done) {
        injector.module(moduleName, 'val');
        assert.isDefined(injector.getModule(moduleName), 'registers the module with the helper function');
        done();
    });
    
});

//

function setUpModules (callback) {
    fs.mkdirSync(path.join(__dirname, 'modules'));
    fs.writeFileSync(path.join(__dirname, 'modules', moduleFilename), '// inject\n\nexports.' + moduleName + ' = function () {\nreturn ' + moduleReturn + ';\n};\n\nexports.' + objectModuleName + ' = {prop1: "prop value"};\n\nexports.' + stringModuleName + ' = "string module value"', 'utf8');
}

function tearDownModules () {
    fs.unlinkSync(path.join(__dirname, 'modules', moduleFilename));
    return fs.rmdirSync(path.join(__dirname, 'modules'));
}

