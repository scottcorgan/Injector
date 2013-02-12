"use strict";

var Injector = require('../injector');
var path = require('path');

// Set up our application

// #1 option to start app

Injector.create('Sevenly', {
    directory: path.join(__dirname, 'modules')
    // exclude: ['modules/models']
}, function (modules) {
    console.log('Injector application started.');
});

// #2 option to start app

// var injector = new Injector('Sevenly', {directory: path.join(__dirname, 'modules')});
// injector.bootstrap(function (modules) {
    
// });























