module.exports = function (injector) {
  return {
    name: 'inject',
    definition: function () {
      return function (moduleName) {
        var injectDeps = injector.resolveDependencies([moduleName]);
        
        if (Array.isArray(injectDeps)) {
          return injectDeps[0];
        }
        
        return injectDeps;
      }
    }
  };
}