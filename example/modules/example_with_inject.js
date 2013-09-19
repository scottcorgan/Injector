// inject

exports.withInject = function (inject) {
  
  // The "inject" method works the same as the core "require"
  // method, except it allows you to mock that dependency
  // when testing.
  
  var fs = inject('fs');
  
  // Use "fs" as you normally would  
  fs.readFile(__dirname + '/example_module.js', function (err, file) {});
  
  // This injects the "constants" module in the "example_values.js"
  // file
  var constants = inject('constants')
  console.log(constants.PI);
}