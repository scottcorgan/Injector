# Injector

Dependency injection for Nodejs.

And when I say basic, I mean basic. The idea with building this module was to create an open, flexible module system and not enforce new structures and coding styles.

Current Version: **0.2.10**

[![Build Status](https://travis-ci.org/scottcorgan/Injector.png)](https://travis-ci.org/scottcorgan/Injector)

## Installation

```
npm install injector
```

## Usage

### Setup

This is where the application is set up (or bootstrapped). It is most likely going to exist before any kind of server or database connection.

#####Option 1#####

```javascript

// Require modules

var Injector = require('injector');
var path = require('path');

// Set up our application

Injector.create('OurApplication', {
    
    // This is the directory where are modules will live
  
    directory: [
        path.join(__dirname, 'modules'), // this would be ./modules
        path.join(__dirname, 'testing') // this would be ./testing
    ],
    
    // This is an array of all directories to ignore
    
    exclude: ['modules/models'] // this would be ./modules/models (OPTIONAL)
}, function (err, injector) {
    // Callback code goes here
});
```

#####Option 2 #####

```javascript

// Require modules

var Injector = require('injector');
var path = require('path');

// Set up our application

var app = new Injector('OurApplication', {
    
    // These are the directories where are modules will live
  
    directory: [
        path.join(__dirname, 'modules'), // this would be ./modules
        path.join(__dirname, 'testing') // this would be ./testing
    ],
    
    // This is an array of all directories to ignore
    
    exclude: ['modules/models'] // this would be ./modules/models (OPTIONAL)
});

// Bootstrap our application

app.bootstrap(function (err, modules) {
    // Callback code goes here
});

```

* * *

### A Module

To declare an injectable module, the file must start with `// inject`. This is how the file is declared injectable.

Anything following that should be declared with the Nodejs convention `exports.SomeModuleName = function () {}`.

A module may be declared as a **String, Object, Array, or Function** (see below).

A module in a module file will only be bootstrapped if in the folder specified in the ` directory: ` value *(See [Setup](https://github.com/scottcorgan/Injector/blob/master/README.md#setup))*.

```javascript

// inject

// Function with dependency

exports.SomeModule = function (SomeDependency) {
    
    // Module logic goes here
    // Return anything you want public facing
};

exports.SomeDependency = function () {
    return 'Yo!';
}

// Object

exports.AnyName = {
    someKey: 'some value'
};

// String

exports.SOME_CONSTANT = 'some value';

// etc.


```
