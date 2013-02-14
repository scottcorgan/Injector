var fs = require('fs');
var path = require('path');
var assert = require('chai').assert;
var Injector = require('../injector');

var moduleDir = path.join('modules');
var moduleFilename = 'module1.js';
var moduleName = 'ModuleName';


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
    
    test('makes imaginary dependency', function (done) {
        assert.isNull(Injector.imaginaryDependency(), 'imaginary dependency returns null');
        done();
    });
    
    test('create an instance of Injector', function (done) {        
        Injector.create('TestApp', {
            directory: [path.join(__dirname, 'modules')]
        }, function (err, injector) {
            assert.ok(injector instanceof Injector, 'instantiates an instance of Injector');
            done();
        });
    });
    
    
});

// Don't need to test this here because it should go in another test
// assert.isObject(modules, 'created a an object of modules and instantiated Injector');
// assert.ok(modules[moduleName], 'created module with name ModuleName');


function setUpModules (callback) {
    fs.mkdirSync(path.join(__dirname, 'modules'));
    fs.writeFileSync(path.join(__dirname, 'modules', moduleFilename), '// inject\n\nexports.' + moduleName + ' = function () {\n\n};', 'utf8');
}

function tearDownModules () {
    fs.unlinkSync(path.join(__dirname, 'modules', moduleFilename));
    return fs.rmdirSync(path.join(__dirname, 'modules'));
}

