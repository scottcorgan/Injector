var argsList = require('args-list');
var constants = require('./constants');

exports.isModuleFile = function (fileStr) {
  return fileStr.match(constants.IS_MODULE_EXP);
};

exports.processArgs = function (module) {
  return argsList(module);
};

exports.imaginaryDependency = function () {
  return null;
};

