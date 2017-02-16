"use strict";
const vscode_languageclient_1 = require("vscode-languageclient");
/**
 * Settings for the server
 */
class ServerSettings {
    static getServerSettings(serverModule) {
        return {
            run: { module: serverModule, transport: vscode_languageclient_1.TransportKind.ipc },
            debug: { module: serverModule, transport: vscode_languageclient_1.TransportKind.ipc, options: debugSettings }
        };
    }
}
let debugSettings = {
    execArgv: ["--nolazy", "--debug=6009"]
};
module.exports = ServerSettings;
//# sourceMappingURL=ServerSettings.js.map