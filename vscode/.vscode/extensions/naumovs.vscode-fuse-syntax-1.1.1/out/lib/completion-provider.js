'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CompletionProvider = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /// <reference path="../../node_modules/vscode/typings/index.d.ts" />


var _vscode = require('vscode');

var _client = require('./client');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var CompletionProvider = exports.CompletionProvider = function () {
  function CompletionProvider(lang) {
    _classCallCheck(this, CompletionProvider);

    this.lang = lang;
  }

  _createClass(CompletionProvider, [{
    key: 'provideCompletionItems',
    value: function provideCompletionItems(document, position, token) {
      var _this = this;

      return new Promise(function (resolve, reject) {
        var filename = document.fileName;

        if (position.character <= 0) {
          return resolve([]);
        }

        var source = document.getText();

        return resolve((0, _client.request)({
          "Name": "Fuse.GetCodeSuggestions",
          "Arguments": {
            // Typically "UX" or "Uno"
            "SyntaxType": _this.lang,
            // Path to document where suggestion is requested
            "Path": document.fileName,
            // Full source of document where suggestion is requested
            "Text": source,
            // 1-indexed text position within Text where suggestion is requested
            "CaretPosition": { "Line": 1 + position.line, "Character": 1 + position.character }
          }
        }).then(function (payload) {
          if (payload.Status === 'Success') {
            var result = payload.Result;

            if (result.IsUpdatingCache) {
              return [];
            }

            return result.CodeSuggestions.map(function (item) {
              var kind = _vscode.CompletionItemKind[item.Type];

              return new _vscode.CompletionItem(item.Suggestion, kind);
            });
          }

          return [];
        }));
      });
    }
  }]);

  return CompletionProvider;
}();