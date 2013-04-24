# Injector

Directory-independent dependency injection for Nodejs.

The idea behind this module is an open, flexible, directory-independent module system that does not enforce new coding styles foreign to Nodejs.

Current Version: **0.3.4**

[![Build Status](https://travis-ci.org/scottcorgan/Injector.png)](https://travis-ci.org/scottcorgan/Injector)

## Installation

```
npm install injector --save
```

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

* **directory** - a list of directories to use to look for injector modules
* **exclude** - (OPTIONAL) a list of directories to ignore when looking for injector modules

## Modules

To declare an injectable module, the file must start with `// inject` (or ` # inject ` for Coffeescript). This is how the file is declared injectable.

Anything following that should be declared with the Nodejs convention `exports.SomeModuleName = function () {}`. A module may be declared as a **String, Object, Array, or Function** (see below).

A module in a module file will only be bootstrapped if in the folder specified in the ` directory: ` value *(See [Setup](https://github.com/scottcorgan/Injector/blob/master/README.md#setup))*.

#### Function

```javascript
// inject

exports.SomeModule = function (SomeDependency) {
    
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
