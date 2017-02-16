"use strict";
const CommonPathFinder_1 = require("./Helper/CommonPathFinder");
const vscode_languageserver_1 = require("vscode-languageserver");
class CompletionItemFactory {
    /**
     * Gets an item
     */
    static getItem(inner) {
        return {
            label: inner.method + (this.ShowNamespace ? " (" + inner.namespace + ")" : ""),
            kind: vscode_languageserver_1.CompletionItemKind.Function,
            insertText: `${inner.method} = ${inner.namespace}.${inner.method};`,
            data: 365
        };
    }
    /**
     * Gets an item, including an import at the top if required
     */
    static getInlineItem(inner) {
        return {
            label: inner.method + (this.ShowNamespace ? " (" + inner.namespace + ")" : ""),
            kind: vscode_languageserver_1.CompletionItemKind.Function,
            insertText: `${inner.method}\u200B\u200B`,
            data: 365
        };
    }
    /**
     * Gets a cmmon JS implementation of an import
     */
    static getItemCommonJS(inner) {
        let label;
        let insertText;
        /// Need to deal with legacy and ES6
        if (inner.method) {
            label = inner.method + (this.ShowNamespace ? " (" + inner.namespace + ")" : "");
            insertText = `{ ${inner.method} } from "${CommonPathFinder_1.GetCommonJSPath(inner)}";`;
        }
        else {
            /// Ignore the flag otherwise we've got nothing to show
            label = inner.namespace;
            insertText = `${inner.namespace} = require("${CommonPathFinder_1.GetCommonJSPath(inner)}")`;
        }
        return {
            label: label,
            kind: vscode_languageserver_1.CompletionItemKind.Function,
            insertText: insertText
        };
    }
    /**
     * Gets a cmmon JS implementation of an import
     */
    static getInlineItemCommonJS(inner) {
        let label;
        let insertText;
        /// Need to deal with legacy and ES6
        if (inner.method) {
            label = inner.method + (this.ShowNamespace ? " (" + inner.namespace + ")" : "");
            insertText = `${inner.method}\u200B\u200B`;
        }
        else {
            /// Ignore the flag otherwise we've got nothing to show
            label = inner.namespace;
            insertText = `${inner.namespace}\u200B\u200B`;
        }
        return {
            label: label,
            kind: vscode_languageserver_1.CompletionItemKind.Function,
            insertText: insertText
        };
    }
}
/**
 * Show namespace
 */
CompletionItemFactory.ShowNamespace = true;
exports.CompletionItemFactory = CompletionItemFactory;
//# sourceMappingURL=CompletionItemFactory.js.map