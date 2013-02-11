
module.exports = function injector(app) {
    
    app.module('Test', function (PI) {
        console.log(PI);
    });
    
};