'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const jumper_1 = require('./jumper');
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    const decoratorOptions = {
        dark: {
            color: '#fff',
            backgroundColor: '#848484',
        }
    };
    const jumper = new jumper_1.default({ decoratorOptions: decoratorOptions });
    context.subscriptions.push(vscode.commands.registerCommand('extension.toggleLabels', function () {
        return __awaiter(this, void 0, void 0, function* () {
            yield jumper.clearTags();
            jumper.state = jumper_1.JumperState.Input;
        });
    }));
    // TODO: disengage if anything but a-z is pressed
    context.subscriptions.push(vscode.commands.registerCommand('type', function (args) {
        return __awaiter(this, void 0, void 0, function* () {
            if (jumper.state === jumper_1.JumperState.Jump) {
                yield jumper.keypress(args.text);
            }
            else if (jumper.state === jumper_1.JumperState.Input) {
                // TODO put this in jumper.ts?
                if (jumper.isValidKey(args.text)) {
                    const tags = yield jumper.getTagsForKey(args.text);
                    yield jumper.setTags(tags);
                }
                else {
                    yield jumper.clearTags();
                }
            }
            else {
                vscode.commands.executeCommand('default:type', args);
            }
        });
    }));
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map