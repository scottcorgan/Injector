module.exports = function injector (app) {
    
    app.constant('PI', 3.14159);
    
    app.module('someFile', function (Test) {
        
    });
    
};