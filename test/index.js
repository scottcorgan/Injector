"use strict";

var Injector = require('../injector');
var path = require('path');

// Set up our application

Injector.create('Sevenly', {
    directory: path.join(__dirname, 'modules')
    // exclude: ['modules/models']
}, function (app) {
    console.log('Injector application started.');
});

























