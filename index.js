"use strict";

// Get injector

var Inject = require('./inject');

// Set up our application

Inject.create('Sevenly', {
    include: ['modules'],
    exclude: ['models']
});























