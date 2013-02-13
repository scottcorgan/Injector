var assert = require('chai').assert;
var Injector = require('../injector');


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
    
    test('creates an instance of Injector', function (done) {
        // Injector.create
        done();
    });
});
