'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.HighlightProvider = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /// <reference path="../../node_modules/vscode/typings/index.d.ts" />


var _vscode = require('vscode');

var _client = require('./client');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var HighlightProvider = exports.HighlightProvider = function () {
  function HighlightProvider() {
    _classCallCheck(this, HighlightProvider);
  }

  _createClass(HighlightProvider, [{
    key: 'provideDocumentHighlights',
    value: function provideDocumentHighlights(document, position, token) {

      if (!document.isDirty) {
        (0, _client.event)({
          "Name": "Fuse.Preview.SelectionChanged",
          "Data": {
            "Path": document.fileName, // Path to the file where selection was changed
            "Text": document.getText(), // Full source of document
            "CaretPosition": { "Line": 1 + position.line, "Character": 1 + position.character }
          }
        });
      }

      return Promise.reject();
    }
  }]);

  return HighlightProvider;
}();