"use strict";

// Node modules
var walk = require('walk');
var fs = require('fs');
var path = require('path');
var async = require('async');
var assert = require('assert');
var inject = require('./lib/inject');
var constants = require('./lib/constants');
var utils = require('./lib/utils');

//
var Injector = function (injectorName, args) {
    var self = this;
    var _args = args || {};
    
    // Include single directory
    if (typeof _args.directory === 'string') {
        _args.directory = [_args.directory];
    }
    
    // Set up defaults
    this.modulesDirectory = _args.directory || ['./'];
    this.excludeFolders = _args.exclude || [];
    
    // Modules
    this.modules = {};
    
    // Error checking
    assert.notEqual(typeof _args.directory, 'function', 'Directory must be an array or a string');
    assert.notEqual(typeof this.modulesDirectory.indexOf, 'undefined', 'Directory cannot be an object');
    assert.equal(this.modulesDirectory.indexOf('node_modules'), -1, 'Cannot put Injector modules in the node_modules directory.');
};

Injector.prototype.collectModules = function (callback) {
    var self = this;
    var modulesDirectory = this.modulesDirectory;
    
    // Get modules from each director
    async.map(modulesDirectory, function (directory, moduleCB) {
        // Set up our directory walker
        var walker = walk.walk(directory, {
            followLinks: false
        });
        
        // Event for each file in the directories
        walker.on('file', function (root, fileStats, next) {
            
            // Only init javascript files we don't exclude
            var fileNameArr = fileStats.name.split('.');
            
            if (self.excludeFolders.indexOf(root) > -1 || constants.SUPPORTED_FILE_EXT.indexOf(fileNameArr[fileNameArr.length-1]) < 0) {
                return next();
            }
            var fileName = path.join(root, fileStats.name);
            
            // Read file as string and match against injector
            fs.readFile(fileName, 'utf8', function (err, file) {
                if (utils.isModuleFile(file)) {
                    
                    // Add the modules if it's an injectable set
                    var modules = require(fileName);
                    
                    // Register the module in our object then move onto next file
                    return async.each(Object.keys(modules), function (moduleName, cb) {
                        var module = modules[moduleName];
                        self.module(moduleName, module);
                        cb(null);
                    }, next);
                }
                
                next();
            });
            
        });
        
        // All done getting modules
        walker.on('end', function () {
            moduleCB(null, self.modules);      
        });
        
        
    }, callback);
};

Injector.prototype.getModule = function (moduleName) {
    var module = this.modules[moduleName];
    
    if (moduleName === 'inject') {
        module = inject(this);
    }
    
    return module;
};

Injector.prototype.register = function (args) {
    
    var _errMsg = args.errMsg || 'Cannot have two items with the same name.';
    
    // Test for duplications
    if (args.name in this.modules) {
        throw new Error('Tried to overwrite "' + args.name + '". ' + _errMsg);
    }
    
    // Add item to collection
    this.modules[args.name] = {
        name: args.name,
        val: args.val,
        dependsOn: args.deps,
        bootstrapped: constants.NOT_BOOSTRAPPED
    };
    
    // For method chaining
    return this.modules[args.name];
};

Injector.prototype.resolveDependencies = function (moduleDeps) {
    // Return no dependencies if the module is undefined
    if (!moduleDeps) {
        return [];
    }
    
    var self = this;
    
    // Resolve dependency logic
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
        
        //
        return module.bootstrapped;
    });
};

Injector.prototype.parse = function (module) {
    var self = this;
    
    // Module is not a function
    if (typeof module.val !== 'function') {
        module.bootstrapped = module.val;
    }
    
    // The module was already bootstrapped
    if(module.bootstrapped !== constants.NOT_BOOSTRAPPED) {
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
    
    // Set our module as bootstrapped
    
    module.bootstrapped = module.val.apply(self, deps);
    return module
};

Injector.prototype.bootstrap = function (callback) {
    var self = this;
    var _callback = callback || function () {};
    
    // Collect all our modules before we bootstrap them
    this.collectModules(function (modules) {
        
        // Bootstrap each module once
        async.each(Object.keys(self.modules), function (moduleName, cb) {
            self.parse(self.getModule(moduleName));
            cb();
        }, function (err) {
            _callback(null, self.modules);
        });
    });
    
    
};

Injector.prototype.module = function (name, logic) {
    
    // Get our dependencies
    var deps = utils.processArgs(logic);
    
    // Register the module
    var module = this.register({
        name: name,
        val: logic,
        deps: deps,
        errMsg: 'Cannot have two modules with the same name.'
    });
    
    //
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
    function I() {
        return Injector.apply(this, args);
    }
    I.prototype = Injector.prototype;
    
    // Instantiate class
    var injector = new I();
    
    // All done. Set up modules
    injector.bootstrap(function (err, modules) {
        callback(err, injector);
    });
};


// Export our module

module.exports = Injector;