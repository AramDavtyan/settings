"use strict";
const vscode_1 = require("vscode");
// Options to control the language client
let clientOptions = {
    // Register the server for plain text documents
    documentSelector: ['typescript', 'plaintext', 'ts', 'javascript', 'js'],
    synchronize: {
        // Synchronize the setting section 'languageServerExample' to the server
        configurationSection: 'TypeScriptImporter',
        // Notify the server about file changes to '.clientrc files contain in the workspace
        fileEvents: vscode_1.workspace.createFileSystemWatcher('**/.ts', false, true, true)
    }
};
module.exports = clientOptions;
//# sourceMappingURL=ClientSettings.js.map