# Injector

Basic dependency injection for Nodejs.

And when I say basic, I mean basic. The idea with building this module was to create an open, flexible module system and not enforce new structures and coding styles.

## Installation

```
npm install injector
```

## Usage

### Setup

This is where the application is set up (or bootstrapped). It is most likely going to exist before any kind of server or database connection.

```javascript

// Require modules

var Injector = require('injector');
var path = require('path');

// Set up our application

var app = Injector.create('OurApplication', {
    
    // This is the directory where are modules will live
  
    directory: path.join(__dirname, 'modules'), // this would be ./modules
    
    // This is an array of all directories to ignore
    
    exclude: ['modules/models'] // this would be ./modules/models
});
```


### A Basic Module

All module files must start with a basic Nodejs ` module.exports ` and be housed within a ` function injector (app) {} `. The ` app ` variable is our injector object. From this, we can register our modules. A module export wil have no more and no less than the one argument ` app `.

A module in a module file will only be bootstrapped if in the folder specified in the ` directory: ` value *(See [Setup](https://github.com/scottcorgan/Injector/blob/master/README.md#setup))*.

```javascript
module.exports = function injector (app) {
    
    // Some basic private stuff here ...
    
    // Declare our module here
    
    app.module('SomeModule', function (ModuleToInject) {
        
        return {
            someApiMethod: function () {
                
                console.log(ModuleToInject.value1);
                
            }
        }
    });
    
    // Modules can be functions, objects, or basic values
    
    app.module('ModuleToInject', {
        value1: 'value1',
        value2: 'value2'
    });
    
};
```

## API

There are 2 available API methods for registering a module.

### module(Name, Value)
* **Name:** The name of our module
* **Value:** The value of our module. This can be a function, an object, or a basic value (string, number, etc.)

##### Example
```javascript

// Function module defintion

app.module('SomeModule', function () {
    // Do stuff here ...
});

// Object module definition

app.module('SomeObjectModule', {
    value1: 'value1'
    // etc.
});

// Value module definition

app.module('SomeValueModule', 'This sentence is useless ... maybe.');

```

* * *

### constant(Name, Value)
* **Name:** The name of our constant
* **Value:** The value of our constant. This can be a function, an object, or a basic value (string, number, etc.), **BUT** constants cannot receive injected dependencies.

Constants are basically simplified modules. The reason this is in the API is for readability. ` app.constant ` is only a modified wrapper on top of ` app.module `.

##### Example
```javascript

// Basic constant difinition

app.constant(PI, 3.14159);

```
