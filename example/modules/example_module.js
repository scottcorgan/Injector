// inject    <~~ this makes the module "injectable"

exports.exampleModule = function (constants, foo, async) { // <~~ these items are injector fromt he "example_values.js" file

  // Anything put here gets invoked on application start up.
  // Like AngularJS, you'll need to return a value from this module
  // in order for it to be useable in other modules
  
  console.log(foo); // <~~ prints out "bar"

  return function() {
    console.log(constants.PI) // <~~ prints out "3.14"
  }
};