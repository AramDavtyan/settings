"use strict";
const vscode_1 = require("vscode");
const CommunicationMethods = require("../Methods/CommunicationMethods");
const ApplicationGlobals = require("../Application/ApplicationGlobals");
const TSFormatter = require("./TSFormatter");
const OS = require("os");
const fs = require("fs");
const glob = require("glob");
/**
 * TS Watcher class, communicates with the server when things change
 */
class TSWatcher {
    /// ===========================
    /// Properties
    /// ===========================
    /// ===========================
    /// Methods
    /// ===========================
    /**
     * Find all TSConfig's
     */
    constructor() {
        /// VS-Code workspace can not follow symlinks
        glob(vscode_1.workspace.rootPath + "/**/tsconfig.json", { ignore: "**/node_modules/**", follow: true }, (err, matches) => {
            if (!err) {
                this.onTSConfigComplete(matches);
            }
        });
        /**
         * Resync every 15 seconds
         * This NEEDS to be improved to only look at changes, on massive projects it's going to bottleneck
         * Bet365 use case is hitting ~75% CPU briefly
         */
        setInterval(() => {
            /// VS-Code workspace can not follow symlinks
            glob(vscode_1.workspace.rootPath + "/**/tsconfig.json", { ignore: "**/node_modules/**", follow: true }, (err, matches) => {
                if (!err) {
                    ApplicationGlobals.Client.sendNotification(CommunicationMethods.RESYNC);
                    /// Resync command after setting up to go and get the files 
                    this.onTSConfigComplete(matches);
                }
            });
        }, vscode_1.workspace.getConfiguration("TypeScriptImporter").get("SyncInterval") * 1000);
        /// save requests from the server
        ApplicationGlobals.Client.onNotification(CommunicationMethods.SAVE_REQUEST, this.onSaveRequest);
        ApplicationGlobals.Client.onNotification(CommunicationMethods.UNDO_SAVE_REQUEST, this.onUndoSaveRequest);
    }
    /**
     * Once we have the TSConfig files, we can go off and get the TS files
     * NOTE: We exclude node_modules here to avoid I/O overflow
     */
    onTSConfigComplete(list) {
        let count = list.length;
        let scope = this;
        let exclusionList = vscode_1.workspace.getConfiguration("TypeScriptImporter").get("IgnoreListedFolders").split(",");
        list.forEach((item) => {
            for (let element of exclusionList) {
                if (item.toLowerCase().indexOf(element.toLowerCase()) > -1) {
                    count--;
                    /// Once we have ready them all, then go fetch the files and lets try this
                    if (count === 0) {
                        scope.findTSFiles.call(scope);
                    }
                    return;
                }
            }
            /// d:/Web/JS/Project/api/database-controller/tsconfig.json
            /// (database-controller)(tsconfig)
            /// Match everything that isn't a forward slash before the tsconfig
            let framework = item.match(/([^\/]+)(\/tsconfig)/);
            /// If we get a match, then assume this is a framework
            if (framework) {
                vscode_1.workspace.openTextDocument(item).then((document) => {
                    count--;
                    /// TSConfig
                    let content;
                    try {
                        content = JSON.parse(document.getText());
                    }
                    catch (e) {
                    }
                    let response = { name: framework[1], dependancies: [] };
                    /// If the TSConfig has JSON
                    if (content) {
                        /// if we have a workflowFiles section, we need to do specific logic. Otherwise, look for the config item
                        if (content.workflowFiles) {
                            content.workflowFiles.forEach((item) => {
                                /// {!example}
                                if (item.indexOf("!{") > -1) {
                                    response.dependancies.push(item.match(/(\w+)/)[1]);
                                }
                            });
                        }
                        else {
                            /// If we have a frameworks section
                            /// This does already return a string, but the compound seems to be confusing the compiler
                            response.dependancies = content[(vscode_1.workspace.getConfiguration("TypeScriptImporter").get("TSConfigFrameworkName"))];
                        }
                        if (content.compilerOptions && content.compilerOptions.module && content.compilerOptions.module.toLowerCase() === "commonjs") {
                            TSFormatter.CommonJS.push(framework[1]);
                        }
                    }
                    /// Register with the server
                    ApplicationGlobals.Client.sendNotification(CommunicationMethods.TSCONFIG_UPDATE, response);
                    /// Once we have ready them all, then go fetch the files and lets try this
                    if (count === 0) {
                        scope.findTSFiles.call(scope);
                    }
                });
            }
        });
    }
    /**
     * Find all TS files
     */
    findTSFiles() {
        /// VS-Code workspace can not follow symlinks
        glob(vscode_1.workspace.rootPath + "/**/*.ts", { ignore: "**/node_modules/**", follow: true }, (err, matches) => {
            if (!err) {
                this.onTSComplete(matches);
            }
        });
    }
    /**
     * Once we complete finding the TS files, loop over them and format them for the server
     * We're doing heavy lifting on the client here as we don't want to have to loop over hundreds of files on the server
     * When we aleady have access to them here
     */
    onTSComplete(list) {
        list.forEach((item) => {
            if (item.indexOf(".d.ts") === -1) {
                // workspace.openTextDocument(item.path).then((document: TextDocument) => {
                //     ApplicationGlobals.Client.sendNotification({
                //         method: CommunicationMethods.NAMESPACE_UPDATE}, 
                //         TSFormatter.Format(document.getText(), item.path)
                //     );
                // })
                /// Workspace crashes, so we're going to use native node
                fs.readFile(item, "utf8", (err, data) => {
                    if (!err) {
                        ApplicationGlobals.Client.sendNotification(CommunicationMethods.NAMESPACE_UPDATE, TSFormatter.Format(data, item));
                    }
                });
            }
        });
    }
    /**
     * When we request a save
     */
    onSaveRequest(...args) {
        const edit = new vscode_1.WorkspaceEdit();
        const target = args[1];
        const line = args[2];
        var input;
        if (!target.commonJS) {
            input = "    import " + target.method + " = " + target.namespace + "." + target.method + ";" + OS.EOL;
        }
        else {
            input = "import " + target.path + OS.EOL;
        }
        vscode_1.workspace.openTextDocument(vscode_1.Uri.file(args[0])).then((doc) => {
            const common = target.commonJS;
            const split = doc.getText().split(OS.EOL);
            const textTarget = split[line];
            /// Remove the hidden character
            edit.replace(vscode_1.Uri.file(args[0]), new vscode_1.Range(new vscode_1.Position(line, textTarget.indexOf("\u200B\u200B")), new vscode_1.Position(line, textTarget.indexOf("\u200B\u200B") + 2)), "");
            if (doc.getText().indexOf(input) === -1) {
                if (common) {
                    edit.insert(vscode_1.Uri.file(args[0]), new vscode_1.Position(1, 0), input);
                }
                else {
                    /// Check if we have a namespace or module
                    if (doc.getText().match(/(namespace|module)\s(\w+)/)) {
                        /// Find it
                        for (let i = 0, len = split.length; i < len; i++) {
                            if (split[i].match(/(namespace|module)\s(\w+)/)) {
                                /// Insert here
                                edit.insert(vscode_1.Uri.file(args[0]), new vscode_1.Position(i + 1, 0), input);
                                break;
                            }
                        }
                    }
                    else {
                        input = input.replace("    import", "import");
                        /// Otherwise put it at the top
                        edit.insert(vscode_1.Uri.file(args[0]), new vscode_1.Position(0, 0), input);
                    }
                }
            }
            vscode_1.workspace.applyEdit(edit);
        });
    }
    /**
     * Undo a save
     */
    onUndoSaveRequest(file) {
        const edit = new vscode_1.WorkspaceEdit();
        vscode_1.workspace.openTextDocument(vscode_1.Uri.file(file)).then((doc) => {
            const split = doc.getText().split(OS.EOL);
            for (let i = 0; i < split.length; i++) {
                if (split[i].indexOf("\u200B") > -1) {
                    /// Remove the hidden character
                    edit.replace(vscode_1.Uri.file(file), new vscode_1.Range(new vscode_1.Position(i, split[i].indexOf("\u200B\u200B")), new vscode_1.Position(i, split[i].indexOf("\u200B\u200B") + 2)), "");
                }
            }
            vscode_1.workspace.applyEdit(edit);
        });
    }
}
module.exports = TSWatcher;
//# sourceMappingURL=TSWatcher.js.map