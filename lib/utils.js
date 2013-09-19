var constants = require('./constants');

exports.isModuleFile = function (fileStr) {
  return fileStr.match(constants.IS_MODULE_EXP);
};