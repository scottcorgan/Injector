# Injector

Directory-independent dependency injection for Nodejs.

The idea behind this module is an open, flexible, directory-independent module system that does not enforce new coding styles foreign to Nodejs.

Current Version: **0.4.3**

[![Build Status](https://travis-ci.org/scottcorgan/Injector.png)](https://travis-ci.org/scottcorgan/Injector)

## Example

If you need an example to help you get started, I've created a small and easy example of most of the features of Injector.

[View the example of a working injector app](https://github.com/scottcorgan/Injector/tree/master/example)

## Install

[![NPM](https://nodei.co/npm/injector.png)](https://nodei.co/npm/injector/)

## Setup

This is where the application is set up (or bootstrapped). It is most likely going to exist before any kind of server or database connection.

```javascript

// Require modules
var Injector = require('injector');

// Injector config
var config = {
    directory: [ 'some/module/directory' ],
    exclude: [ 'some/other/directory' ] // (OPTIONAL)
};

// Set up our application
Injector.create('ApplicationName', config, function (err, injector) {
    // Callback code goes here
});
```

## Configuration

* **directory** - a list of directories to use to look for injector modules (string or array)
* **exclude** - (OPTIONAL) a list of directories to ignore when looking for injector modules

## Modules

To declare an injectable module, the file must start with `// inject` (or ` # inject ` for Coffeescript). This is how the file is declared injectable.

Anything following that should be declared with the Nodejs convention `exports.SomeModuleName = function () {}`. A module may be declared as a **String, Object, Array, or Function** (see below).

A module in a module file will only be bootstrapped if in the folder specified in the ` directory: ` value *(See [Setup](https://github.com/scottcorgan/Injector/blob/master/README.md#setup))*.

#### Function

```javascript
// inject

exports.SomeModule = function (inject, SomeDependency) {
    
    // Injector now provides the 'inject' method, allowing
    // you to inject core modules, npm modules, or injector
    // modules.
    var fs = inject('fs');
    
    // Module logic goes here
    // Return anything you want public facing
    
    someDependency(); // outputs 'Yo!'
};

exports.SomeDependency = function () {
    return 'Yo!';
}
```

#### Object

```javascript
// inject

exports.AnyName = {
    someKey: 'some value'
};
```

#### String

```javascript
// inject

exports.SOME_CONSTANT = 'some value';
```

## Run tests

```
npm test
```

## Changelog

### 0.4.3
* FIXED: Refactored loading internal core modules. Exciting for future features!

### 0.4.2
* NEW: ` inject() ` method available for a more commonjs approach. See *examples* for usage.
* FIXED: Breaking tests. Better coverage

### 0.4.0
* NEW: Npm modules in *node_modules* directory are now injectable like a normal Injector module. No need to call ` require('') ` in any module now.
* NEW: Using ` /* inject */ ` now also declares a file has having an injectable module
* NEW: define one OR multiple module directories
* FIXED: error with invalid directory type (object, function, etc). Only strings or arrays are allowed
