"use strict";

// Node modules

var walk = require('walk'),
    fs = require('fs'),
    path = require('path');

// Constants

var FN_ARGS = /^function\s*[^\(]*\(\s*([^\)]*)\)/m,
    MODULE_FINDER_EXP = /^\s*module.exports\s?=\s?function\s?injector\s?[(]\s?app\s?[)]/,
    NOT_BOOSTRAPPED = '*|*|*'; // Random(ish) string

/**
 * Injector constructor
 * @param {String} injectorName 
 * @param {Object} args         
 */
var Injector = function (injectorName, args) {
    var self = this;
    
    // Set up defaults
    this.modulesDirectory = args.directory || '/';
    this.excludeFolders = args.exclude || [];
    
    // Modules
    
    this.modules = {};
    
    // Find all of our modules by walking the dirctories recursively
    
    // Set up the directory/file walker
    
    if (this.modulesDirectory.indexOf('node_modules') > -1) {
        throw new Error('Cannot put Injector modules in the node_modules directory.');
    }
     
    this.walker = walk.walk(this.modulesDirectory, {
        followLinks: false
    });
    
    this.walker.on('file', function (root, fileStats, next) {
        
        // Only init javascript files we don't exclude
        
        var fileNameArr = fileStats.name.split('.');
        if (self.excludeFolders.indexOf(root) > -1 || fileNameArr[fileNameArr.length-1] !== 'js') {
            return next();
        }
        
        var fileName = path.join(root, fileStats.name);
        
        // Read file as string and match against injector
        
        fs.readFile(fileName, 'utf8', function (err, file) {
            if (file.match(MODULE_FINDER_EXP)) {
                
                // Add the modules if it's an injectable set
                
                require(fileName)(self);
            }
            return;
        });
        
        // Move onto next file
        
        next();
    });
    
    // Bootstrap application when done getting all the modules
    
    this.walker.on('end', function () {
        self.bootstrap();
        
        // Emit event here that let's people know application was bootstrapped/loaded
        
    });
};

/**
 * Get for a module by it's name
 * @param  {String} moduleName 
 * @return {Object}            
 */
Injector.prototype.getModule = function (moduleName) {
    return this.modules[moduleName];
};

/**
 * Process the module
 * @param  {Object} module
 * @return {Array} args
 */
Injector.processArgs = function (module) {
    var depsStr =  module.toString().match(FN_ARGS),
        deps = (depsStr) ? depsStr[1].split(',') : [''];
    
    // No dependencies, so we return empty array
    
    if(deps[0] === ''){
        return [];
    }
    
    // Trim the strings in the dependency array return
    
    return deps.map(function (dep) {
        return dep.trim();
    });
};

/**
 * Collection our collections
 * @param  {Object} args 
 * @return {Object}
 */
Injector.prototype.register = function (args) {
    
    var _errMsg = args.errMsg || 'Cannot have two items with the same name.';
    
    // Test for duplications
    
    if (args.name in this.modules) {
        throw new Error(_errMsg);
    }
    
    // Add item to collection
    
    this.modules[args.name] = {
        name: args.name,
        val: args.val,
        dependsOn: args.deps,
        bootstrapped: NOT_BOOSTRAPPED
    };
    
    // For method chaining
    
    return this.modules[args.name];
};

/**
 * Dependencies that don't exist return null;
 * @return {Null} 
 */
Injector.imaginaryDependency = function () {
    return null;
};

/**
 * Resolve dependencies in list
 * @param  {Array} moduleDeps 
 * @return {Array}
 */
Injector.prototype.resolveDependencies = function (moduleDeps) {
    var self = this;
    
    // Resolve dependency logic
    
    return moduleDeps.map(function (depName) {
        var module = self.getModule(depName);
        
        if(depName === '' || !module) {
            return Injector.imaginaryDependency();
        }
        
        return module.bootstrapped;
    });
};

/**
 * Parse our dependencies and execute them
 * @param  {Object} module 
 * @param  {Array} deps  
 * @return {Object}
 */
Injector.prototype.parse = function (module, deps) {
    var self = this;
    
    // Module is not a function
    
    if (typeof module.val !== 'function') {
        module.bootstrapped = module.val;
    }
    
    // The module was already bootstrapped
    if(module.bootstrapped !== NOT_BOOSTRAPPED) {
        return module;
    }
    
    // Resolve null dependencies
    // All deps need to be bootstrapped first
    
    this.resolveDependencies(module.dependsOn).forEach(function (dep, idx) {
        if (dep === NOT_BOOSTRAPPED) {
            var depName = module.dependsOn[idx];
            self.parse(self.getModule(depName));
        }
    });
    
    var deps = this.resolveDependencies(module.dependsOn);
    
    // Set our module as bootstrapped
    module.bootstrapped = module.val.apply(module, deps);
    return module
};

/**
 * Start the injection and init the modules
 */
Injector.prototype.bootstrap = function () {
    var self = this    
    
    // Bootstrap each module once
    
    Object.keys(this.modules).forEach(function (moduleName) {
        self.parse(self.getModule(moduleName));
    });
};


/**
 * Set up a constant for the app
 * @param  {String} name
 * @param  {String} val  
 * @return {Object?}
 */
Injector.prototype.constant = function (name, val) {
    
    var constant = this.register({
        name: name,
        val: val,
        errMsg: 'Cannot have two constants with the same name.'
    });
    
    //
    
    return constant;
};

/**
 * Module: this is the basic dependency in the app
 * @param  {String} name  
 * @param  {Function/Object} logic 
 * @return {Function/Object}
 */
Injector.prototype.module = function (name, logic) {
    
    // Get our dependencies
    
    var deps = Injector.processArgs(logic);
    
    // Register the module
    
    var module = this.register({
        name: name,
        val: logic,
        deps: deps,
        errMsg: 'Cannot have two modules with the same name.'
    });
    
    //
    
    return module;
};

/**
 * Instantiants Injector with unlimited arguments
 * @return {Object}
 */
Injector.create = function () {
    var args = Array.prototype.slice.call(arguments);
    
    function I() {
        return Injector.apply(this, args);
    }
    I.prototype = Injector.prototype;
    
    return new I();
};


// Export our module

module.exports = Injector;