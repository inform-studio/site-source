"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports["default"] = function () {
  return function (files) {
    Object.keys(files).forEach(function (filename) {
      if (!files[filename].filename) {
        let name = filename.split('/').pop().split('.')[0]
        files[filename].filename = name;
      }
    });
  };
};

module.exports = exports["default"];