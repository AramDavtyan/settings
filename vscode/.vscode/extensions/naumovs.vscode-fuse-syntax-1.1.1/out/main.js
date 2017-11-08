'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.activate = activate;

var _vscode = require('vscode');

var _completionProvider = require('./lib/completion-provider');

var _highlightProvider = require('./lib/highlight-provider');

function activate(context) {
  _vscode.languages.registerCompletionItemProvider('ux', new _completionProvider.CompletionProvider('UX'));
  _vscode.languages.registerCompletionItemProvider('uno', new _completionProvider.CompletionProvider('Uno'));
  _vscode.languages.registerDocumentHighlightProvider('ux', new _highlightProvider.HighlightProvider());
} /// <reference path="../node_modules/vscode/typings/index.d.ts" />