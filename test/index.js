"use strict";

var Injector = require('../injector');
var path = require('path');

// Set up our application

var app = Injector.create('Sevenly', {
    directory: path.join(__dirname, 'modules'),
    exclude: ['modules/models']
});

























