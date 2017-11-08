//// <reference path="../node_modules/open/lib/open.js" />
// node_modules
const vscode = require( 'vscode' );
const open = require( 'open' );
// my class
const EaseServer = require( './EaseServer' );
// instance
const config = vscode.workspace.getConfiguration( 'staticServer' ) || {};
const wwwRoot = vscode.workspace.rootPath;
/**
 * @param  {vscode.ExtensionContext} context
 */
function activate( context ) {
    console.log( '"StaticServer" is now active!' );

    var server = new EaseServer( config.portNumber, wwwRoot, config.host );
    context.subscriptions.push( server );

    var disposable;
    disposable = vscode.commands.registerCommand( 'staticserver.start', () => {
        server.start().then(() => {
            openInBrowser();
        }).catch( err => {
            vscode.window.showInformationMessage( 'StaticServer fail:' + err );
        });
    });
    context.subscriptions.push( disposable );

    disposable = vscode.commands.registerCommand( 'staticserver.stop', () => {
        server.stop().then(() => {
            vscode.window.showInformationMessage( 'StaticServer has been stopped' );
        });
    });
    context.subscriptions.push( disposable );

    disposable = vscode.commands.registerCommand( 'staticserver.openInBrowser', () => {
        openInBrowser();
    });
    context.subscriptions.push( disposable );
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;

function openInBrowser() {
    var edit = vscode.window.activeTextEditor;
    if ( !edit ) {
        return;
    }
    var fileName = edit.document.fileName.replace( wwwRoot, "" );
    console.log( "openInBrowser: fileName=" + fileName );
    open( `http://${config.host}:${config.portNumber}` + fileName );
}
