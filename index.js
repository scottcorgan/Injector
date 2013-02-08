"use strict";

// Get injector

var Inject = require('./inject');
var app;


// Set up our application

module.exports = app = new Inject('Sevenly', {
    include: '',
    exclude: ''
});


process.nextTick(function () {
    app.init()
    // console.log(app.mod);
});



app.module('Module1', function (Dep1, Dep2) {
    
    // Dep1.test1();
    // console.log(Dep2);
    
    // console.log('Module1 called');
    
    return 'yaaa';
});


app.module('Dep1', function () {
    
    // console.log('Dep1 called');
    
    return {
        test1: function () {
            console.log('dep1 test1');
        }
    };
});

// app.module('Dep2', function () {
//     // console.log('Dep2 called');
//     return {
//         test2: function () {
//             console.log('dep2 test2');
//         }
//     };
// });











