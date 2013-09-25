# Injector

Directory-independent dependency injection for Nodejs.

The idea behind this module is an open, flexible, directory-independent module system that does not enforce new coding styles foreign to Nodejs.

Current Version: **0.5.1**

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
    //
});
```

## Configuration

* **directory** - a list of directories to use to look for injector modules (string or array)
* **exclude** - (OPTIONAL) a list of directories to ignore when looking for injector modules
* **mock** - (OPTIONAL) an object whose keys are module names and values are mocked definitions to override the original module definition. Most likely used for writing unit tests. See [Writing unit tests with Injector](https://github.com/scottcorgan/Injector#writing-unit-tests-with-injector) for an example of how to mock injector dependencies.

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

## Writing unit tests with **Injector**

The whole point of dependency injection, especially with Injector, is to create a MUCH easier and reliable way to write tests around your code.

Injector makes TDD (Test Driven Development) very easy by allowing you to mock dependencies through the Injector instance. See the following example for a how-to:

```javascript

var Injector = require('injector');

// Inject are app
Injector.create('AppName', {
    directory: 'someDirectory',
    
    // Here's where you mock dependencies.
    // Just use the dependency's name and redefine it.
    // You can even use dependency injection in the mocks.
    mock: {
        SomeModuleToMock: function (fs) {
            return function () {
                // Module logic here
                return fs;
            }
        }
    }
}, function (err, injector) {
    // App injected
});

```

Now that we've mocked the module ` SomeModuleToMock `, wherever it's injected into other modules, the mock will be injected instead of the original module definition. This is incredibly useful for avoiding network requests or database writes while running your unit tests.

An example of where you might use this would be with a [Redis](https://github.com/mranney/node_redis) connection. Instead of actually connecting to a Redis client, you can mock out Redis to load the module [fakeredis](https://github.com/hdachev/fakeredis). Now writing unit tests around Redis interactions becomes far less painful and reduces the time it takes to run the tests.

## Run **Injector's** tests

```
npm test
```

## Changelog

#### 0.5.1
* FIXED: Mocking dependcies now works with core and npm modules (i.e. async, path, fs, etc.).

### 0.5.0
* NEW: [Inject mocked dependencies](https://github.com/scottcorgan/Injector#writing-unit-tests-with-injector). Makes unit testing your code a breeze!
* FIXED: More reliable manual dependency injection using ` inject `

### 0.4.5
* FIXED: Modules using the ` inject ` method exploded if dependency had not been bootstrapped.

### 0.4.4
* NEW: Manually inject a module from the injector instance variable with ` injector.inject(moduleName) `

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
