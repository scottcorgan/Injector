module.exports = function injector (app) {
    
    app.constant({
        PORT: 8000,
        HOST: '0.0.0.0'
    });
    
    app.constant('SERVER', 8000);
    
};