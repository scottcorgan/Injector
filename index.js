"use strict";

// Get injector

var Inject = require('./inject');
var app;


// Set up our application

module.exports = app = new Inject('Sevenly', {
    include: '',
    exclude: ''
});






app.constant('PI', 3.14159);

var asdf = app.module('Module1', function (PI) {    
    
});











