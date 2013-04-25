// Require modules
var Injector = require('../index.js');
var path = require('path')

// Injector config
var config = {
    directory: [ path.join(__dirname, 'modules') ] // <~~ this directory is the location of my modules
};

// Set up our application
Injector.create('InjectorExampleApp', config, function (err, injector) {
    console.log('Application injected.')
});