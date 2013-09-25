// Node modules
var walk = require('walk');
var fs = require('fs');
var path = require('path');
var async = require('async');
var assert = require('assert');
var inject = require('./lib/core/inject');
var constants = require('./lib/constants');
var utils = require('./lib/utils');

//
var Injector = function (injectorName, args) {
    var self = this;
    var _args = args || {};
    
    if (typeof _args.directory === 'string') {
        _args.directory = [_args.directory];
    }
    
    this.modulesDirectory = _args.directory || ['./'];
    this.excludeFolders = _args.exclude || [];
    this.modules = {};
    this.constants = constants;
    this.mockedModules = _args.mock;
    
    assert.notEqual(typeof _args.directory, 'function', 'Directory must be an array or a string');
    assert.notEqual(typeof this.modulesDirectory.indexOf, 'undefined', 'Directory cannot be an object');
    assert.equal(this.modulesDirectory.indexOf('node_modules'), -1, 'Cannot put Injector modules in the node_modules directory.');
};

Injector.prototype.collectModules = function (callback) {
    var self = this;
    var modulesDirectory = this.modulesDirectory;
    var mockedModules = this.mockedModules || {};
    
    async.map(modulesDirectory, function (directory, moduleCB) {
        var walker = walk.walk(directory, { followLinks: false });
        
        walker.on('file', function (root, fileStats, next) {
            var fileNameArr = fileStats.name.split('.');
            
            if (self.excludeFolders.indexOf(root) > -1 || constants.SUPPORTED_FILE_EXT.indexOf(fileNameArr[fileNameArr.length-1]) < 0) {
                return next();
            }
            
            var fileName = path.join(root, fileStats.name);
            
            fs.readFile(fileName, 'utf8', function (err, file) {
                if (utils.isModuleFile(file)) {
                    var modules = require(fileName);
                    
                    return async.each(Object.keys(modules), function (moduleName, cb) {
                        var module = modules[moduleName];
                        
                        self.module(moduleName, module);
                        cb(null);
                    }, next);
                }
                
                next();
            });
            
        });
        
        walker.on('end', function () {
            self.registerMockModules(function (err, mockedModules) {
                moduleCB(null, self.modules);
            });
        });
        
    }, callback);
};

Injector.prototype.getModule = function (moduleName) {
    return this.modules[moduleName];
};

Injector.prototype.inject = function(moduleName) {
    return this.getModule('inject').bootstrapped(moduleName);
};

Injector.prototype.register = function (args, override) {
    var _errMsg = args.errMsg || 'Cannot have two items with the same name.';
    
    // Test for duplications
    if (!override && args.name in this.modules) {
        throw new Error('Tried to overwrite "' + args.name + '". ' + _errMsg);
    }
    
    this.modules[args.name] = {
        name: args.name,
        definition: args.definition,
        dependsOn: args.dependsOn || [],
        bootstrapped: constants.NOT_BOOSTRAPPED
    };
    
    return this.modules[args.name];
};

Injector.prototype.resolveDependencies = function (moduleDeps) {
    if (!moduleDeps) {
        return [];
    }
    
    var self = this;
    
    return moduleDeps.map(function (depName) {
        var module = self.getModule(depName);
        
        if(depName === '' || !module) {
            module = utils.imaginaryDependency();
            
            // Look for module in node_modules folder
            try{
                module = require(depName);
            }
            catch (e) {}
            
            return module
        }
        
        return module.bootstrapped;
    });
};

Injector.prototype.parse = function (module) {
    var self = this;
    
    if (typeof module.definition !== 'function') {
        module.bootstrapped = module.definition;
    }
    
    if(module.bootstrapped && module.bootstrapped !== constants.NOT_BOOSTRAPPED) {
        return module;
    }
    
    // Resolve null dependencies
    // All deps need to be bootstrapped first
    this.resolveDependencies(module.dependsOn).forEach(function (dep, idx) {
        if (dep === constants.NOT_BOOSTRAPPED) {
            var depName = module.dependsOn[idx];
            self.parse(self.getModule(depName));
        }
    });
    var deps = this.resolveDependencies(module.dependsOn);
    module.bootstrapped = module.definition.apply(self, deps);
    
    return module;
};

Injector.prototype.registerCoreModules = function () {
    var injector = this;
    this.register(inject(injector));
};

Injector.prototype.registerMockModules = function (callback) {
    var self = this;
    var mockedModules = this.mockedModules || {};
    
    async.each(Object.keys(mockedModules), function (moduleName, cb) {
        self.module(moduleName, self.mockedModules[moduleName], true);
        cb();
    }, function () {
        callback(null, mockedModules);      
    });
};

Injector.prototype.bootstrap = function (callback) {
    var self = this;
    var _callback = callback || function () {};
    
    this.registerCoreModules();
    this.collectModules(function (modules) {
        async.each(Object.keys(self.modules), function (moduleName, cb) {
            var moduleDefinition = self.getModule(moduleName);
            self.parse(moduleDefinition);
            
            cb();
        }, function (err) {
            _callback(null, self.modules);
        });
    });
};

Injector.prototype.module = function (name, logic, override) {
    var moduleObj = {
        name: name,
        definition: logic,
        dependsOn: utils.processArgs(logic),
        errMsg: 'Cannot have two modules with the same name.',
    };
    
    var module = this.register(moduleObj, override);
    return this;
};

Injector.create = function () {
    var args = Array.prototype.slice.call(arguments);
    var callback = function () {};
    
    // Did we get a callback?
    if (typeof args[args.length-1] === 'function') {
        callback = args.pop();
    }
    
    // Set up prototype stuff
    function I() { return Injector.apply(this, args); }
    I.prototype = Injector.prototype;
    
    var injector = new I();
    injector.bootstrap(function (err, modules) {
        callback(err, injector);
    });
};

module.exports = Injector;