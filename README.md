# Injector

Basic dependency injection for Nodejs.

## Installation

```
npm install injector
```

## Example

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
