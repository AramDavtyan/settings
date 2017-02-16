/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
'use strict';
const path = require("path");
const vscode_languageclient_1 = require("vscode-languageclient");
const ServerSettings = require("./Settings/ServerSettings");
const ApplicationGlobals = require("./Application/ApplicationGlobals");
const ClientSettings = require("./Settings/ClientSettings");
const TSWatcher = require("./Watcher/TSWatcher");
/// ===================================
/// Can't namespace this function, so everything on the inside is just a variable
/// ===================================
function activate(context) {
    // The server is implemented in node
    let serverModule = context.asAbsolutePath(path.join('server', 'Server.js'));
    ApplicationGlobals.Client = new vscode_languageclient_1.LanguageClient('TypeScript Importer', ServerSettings.getServerSettings(serverModule), ClientSettings);
    ApplicationGlobals.Client.onReady().then(() => {
        new TSWatcher();
    });
    // Push the disposable to the context's subscriptions so that the 
    // client can be deactivated on extension deactivation
    context.subscriptions.push(ApplicationGlobals.Client.start());
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map