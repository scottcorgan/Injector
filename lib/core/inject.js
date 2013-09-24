module.exports = function (injector) {
  return {
    name: 'inject',
    definition: function () {
      return function (moduleName) {
        var module = injector.getModule(moduleName);
        
        if (module) {
          module = injector.parse(module);
        }
        
        var bootstrappedDeps = injector.resolveDependencies([moduleName]);
        
        if (Array.isArray(bootstrappedDeps)) {
          return bootstrappedDeps[0];
        }
        
        return bootstrappedDeps;
      }
    }
  };
}