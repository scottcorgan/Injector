"use strict";

var Inject = require('./inject');
var path = require('path');

// Set up our application

var app = Inject.create('Sevenly', {
    directory: path.join(__dirname, 'modules'),
    exclude: ['modules/models']
});

























