var fs = require('fs');
var path = require('path');

var moduleDir = exports.moduleDir = path.join(__dirname, 'modules');
var moduleFilename = exports.moduleFilename = 'module1.js';
var moduleFile = exports.moduleFile = path.join(moduleDir, moduleFilename);
var moduleName = exports.moduleName = 'ModuleName';
var moduleReturn = exports.moduleReturn = 1;
var objectModuleName = exports.objectModuleName = 'ObjectModule';
var stringModuleName = exports.stringModuleName = 'StringModule';

exports.setUpModules = function (callback) {
    fs.mkdirSync(moduleDir);
    fs.writeFileSync(moduleFile, '// inject\n\nexports.' + moduleName + ' = function (fs, ' + objectModuleName + ') {\nreturn ' + moduleReturn + ';\n};\n\nexports.' + objectModuleName + ' = {prop1: "prop value"};\n\nexports.' + stringModuleName + ' = "string module value"', 'utf8');
};

exports.tearDownModules = function () {
    fs.unlinkSync(path.join(moduleDir, moduleFilename));
    return fs.rmdirSync(moduleDir);
};