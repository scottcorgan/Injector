"use strict";

/**
 
 - create a module class!!!!!!!!!!!!!!!!
 
 
 - create injection
    - walk the directories
    - create the dependency
 - inject a dependency
 
 
 */


var FN_ARGS = /^function\s*[^\(]*\(\s*([^\)]*)\)/m;
var NOT_BOOSTRAPPED = '*|*|*'; // Random(ish) string

//

/**
 * Inject constructor
 * @param {String} injectorName 
 * @param {Object} args         
 */
var Inject = function (injectorName, args) {
    
    /*
        
        Args are:
        - directories to walk
        - directories to ignore
        
     */
    
    // Walk the directory tree here to find dependencies?
    
    
    
    // Modules
    
    this.modules = {};
};

/**
 * Get for a module by it's name
 * @param  {String} moduleName 
 * @return {Object}            
 */
Inject.prototype.getModule = function (moduleName) {
    return this.modules[moduleName];
};

/**
 * Process the module
 * @param  {Object} module
 * @return {Array} args
 */
Inject.processArgs = function (module) {
    var deps = module.toString().match(FN_ARGS)[1].split(',');
    
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
Inject.prototype.register = function (args) {
    
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
    
    return this;
};

/**
 * Dependencies that don't exist return null;
 * @return {Null} 
 */
Inject.imaginaryDependency = function () {
    return null;
};

/**
 * Resolve dependencies in list
 * @param  {Array} moduleDeps 
 * @return {Array}
 */
Inject.prototype.resolveDependencies = function (moduleDeps) {
    var self = this;
    
    // Resolve dependency logic
    
    return moduleDeps.map(function (depName) {
        var module = self.getModule(depName);
        
        if(depName === '' || !module) {
            return Inject.imaginaryDependency();
        }
        
        return module.bootstrapped;
    });
};


Inject.prototype.bootstrap = function (module, deps) {
    var self = this;

    // The module was already bootstrapped
        
    if(module.bootstrapped !== NOT_BOOSTRAPPED) {
        return module;
    }
    
    // Resolve null dependencies
    // All deps need to be bootstrapped first
    
    this.resolveDependencies(module.dependsOn).forEach(function (dep, idx) {
        if (dep === NOT_BOOSTRAPPED) {
            var depName = module.dependsOn[idx];
            self.bootstrap(self.getModule(depName));
        }
    });
    
    var deps = this.resolveDependencies(module.dependsOn);
    
    // Set our module as bootstrapped
    module.bootstrapped = module.val.apply(module, deps);
    return module
};


Inject.prototype.init = function () {
    var self = this    
    
    // Bootstrap each module once
    
    Object.keys(this.modules).forEach(function (moduleName, idx, allModuleNames) {
        self.bootstrap(self.getModule(moduleName));
    });
};


// /**
//  * Set up a constant for the app
//  * @param  {String} name
//  * @param  {String} val  
//  * @return {Object?}
//  */
// Inject.prototype.constant = function (name, val) {
    
//     var constant = this.register({
//         name: name,
//         val: val,
//         errMsg: 'Cannot have two constants with the same name.'
//     });
    
//     //
    
//     return contsant;
// };

/**
 * Module: this is the basic dependency in the app
 * @param  {String} name  
 * @param  {Function/Object} logic 
 * @return {Function/Object}
 */
Inject.prototype.module = function (name, logic) {
    
    // Get our dependencies
    
    var deps = Inject.processArgs(logic);
    
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


// Export our module

module.exports = Inject;