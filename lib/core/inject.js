module.exports = function (injector) {
  return {
    name: 'inject',
    bootstrapped: function (moduleName) {
      var injectDeps = injector.resolveDependencies([moduleName]);
      
      if (Array.isArray(injectDeps)) {
        return injectDeps[0];
      }
      
      return injectDeps;
    }
  };
}