"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    var _ = undefined;
    context.subscriptions.push(vscode.commands.registerCommand('extension.selectDoubleQuote', singleSelect.bind(_, { char: '"' })));
    context.subscriptions.push(vscode.commands.registerCommand('extension.selectSingleQuote', singleSelect.bind(_, { char: "'" })));
    context.subscriptions.push(vscode.commands.registerCommand('extension.selectEitherQuote', selectEitherQuote));
    context.subscriptions.push(vscode.commands.registerCommand('extension.switchQuotes', switchQuotes));
    context.subscriptions.push(vscode.commands.registerCommand('extension.selectBackTick', singleSelect.bind(_, { char: "`", multiline: true })));
    context.subscriptions.push(vscode.commands.registerCommand('extension.selectParenthesis', matchingSelect.bind(_, { start_char: "(", end_char: ")" })));
    context.subscriptions.push(vscode.commands.registerCommand('extension.selectSquareBrackets', matchingSelect.bind(_, { start_char: "[", end_char: "]" })));
    context.subscriptions.push(vscode.commands.registerCommand('extension.selectCurlyBrackets', matchingSelect.bind(_, { start_char: "{", end_char: "}" })));
    context.subscriptions.push(vscode.commands.registerCommand('extension.selectParenthesisOuter', matchingSelect.bind(_, { start_char: "(", end_char: ")", outer: true })));
    context.subscriptions.push(vscode.commands.registerCommand('extension.selectSquareBracketsOuter', matchingSelect.bind(_, { start_char: "[", end_char: "]", outer: true })));
    context.subscriptions.push(vscode.commands.registerCommand('extension.selectCurlyBracketsOuter', matchingSelect.bind(_, { start_char: "{", end_char: "}", outer: true })));
    context.subscriptions.push(vscode.commands.registerCommand('extension.selectAngleBrackets', matchingSelect.bind(_, { start_char: "<", end_char: ">" })));
    context.subscriptions.push(vscode.commands.registerCommand('extension.selectInTag', matchingSelect.bind(_, { start_char: ">", end_char: "<" })));
}
exports.activate = activate;
// Replacables
const starters = ['"', "'", "`", "(", "[", '{'];
const enders = ['"', "'", "`", ")", "]", '}'];
function findOccurances(doc, line, char) {
    var content = doc.lineAt(line);
    var matches = (content.text + "hack").split(char).reduce((acc, p) => {
        var len = p.length + 1;
        if (acc.length > 0) {
            len += acc[acc.length - 1];
        }
        acc.push(len);
        return acc;
    }, []);
    matches.pop();
    return matches;
}
function findNext(doc, line, char, start_index = 0, nest_char = undefined, nested = 0) {
    if (line === doc.lineCount) {
        return undefined;
    }
    ;
    var occurances = findOccurances(doc, line, char).filter(n => n >= start_index);
    var nests = nest_char ? findOccurances(doc, line, nest_char).filter(n => n >= start_index) : [];
    var occurance_index = 0;
    var nests_index = 0;
    while ((occurance_index < occurances.length || nests_index < nests.length) && nested >= 0) {
        if (occurances[occurance_index] < nests[nests_index] || !nests[nests_index]) {
            if (nested === 0) {
                return new vscode.Position(line, occurances[occurance_index]);
            }
            nested--;
            occurance_index++;
        }
        else if (nests[nests_index] < occurances[occurance_index] || !occurances[occurance_index]) {
            nested++;
            nests_index++;
        }
    }
    return findNext(doc, ++line, char, 0, nest_char, nested);
}
function findPrevious(doc, line, char, start_index, nest_char = undefined, nested = 0) {
    if (line === -1) {
        return undefined;
    }
    ;
    if (start_index === undefined) {
        start_index = doc.lineAt(line).text.length;
    }
    var occurances = findOccurances(doc, line, char).filter(n => n <= start_index);
    var nests = nest_char ? findOccurances(doc, line, nest_char).filter(n => n <= start_index) : [];
    var occurance_index = occurances.length - 1;
    var nests_index = nests.length - 1;
    while ((occurance_index > -1 || nests_index > -1) && nested >= 0) {
        if (occurances[occurance_index] > nests[nests_index] || !nests[nests_index]) {
            if (nested === 0) {
                return new vscode.Position(line, occurances[occurance_index]);
            }
            nested--;
            occurance_index--;
        }
        else if (nests[nests_index] > occurances[occurance_index] || !occurances[occurance_index]) {
            nested++;
            nests_index--;
        }
    }
    return findPrevious(doc, --line, char, undefined, nest_char, nested);
}
function findSingleSelect(s, doc, char, outer, multiline) {
    let { line, character } = s.active;
    let matches = findOccurances(doc, line, char);
    let next = matches.find(a => a > character);
    let next_index = matches.indexOf(next);
    let offset = outer ? char.length : 0;
    if (matches.length > 1 && matches.length % 2 === 0) {
        // Jump inside the next matching pair
        if (next === -1) {
            return s;
        }
        if (next_index % 2 !== 0) {
            next_index--;
        }
        //Automatically grow to outer selection
        if (!outer &&
            new vscode.Position(line, matches[next_index]).isEqual(s.anchor) &&
            new vscode.Position(line, matches[next_index + 1] - 1).isEqual(s.end)) {
            offset = char.length;
        }
        return new vscode.Selection(new vscode.Position(line, matches[next_index] - offset), new vscode.Position(line, matches[next_index + 1] - 1 + offset));
    }
    else if (multiline) {
        let start_pos = findPrevious(doc, line, char, character) || new vscode.Position(line, matches[next_index]);
        if (!start_pos) {
            return s;
        }
        ;
        let end_pos = findNext(doc, start_pos.line, char, start_pos.character + 1);
        //Automatically grow to outer selection
        if (!outer &&
            start_pos.isEqual(s.anchor) &&
            new vscode.Position(end_pos.line, end_pos.character - 1).isEqual(s.end)) {
            offset = char.length;
        }
        if (start_pos && end_pos) {
            start_pos = new vscode.Position(start_pos.line, start_pos.character - offset);
            end_pos = new vscode.Position(end_pos.line, end_pos.character - 1 + offset);
            return new vscode.Selection(start_pos, end_pos);
        }
    }
    return s;
}
function singleSelect({ char, outer = false, multiline = false }) {
    let editor = vscode.window.activeTextEditor;
    if (!editor) {
        return;
    }
    ;
    let doc = editor.document;
    let sel = editor.selections;
    editor.selections = sel.map(s => findSingleSelect(s, doc, char, outer, multiline));
}
function selectEitherQuote() {
    let editor = vscode.window.activeTextEditor;
    if (!editor) {
        return;
    }
    ;
    let doc = editor.document;
    let sel = editor.selections;
    editor.selections = sel.map((s) => {
        let singleQuotes = findSingleSelect(s, doc, "'", false, false);
        let doubleQuotes = findSingleSelect(s, doc, '"', false, false);
        if (singleQuotes === s) {
            return doubleQuotes;
        }
        if (doubleQuotes === s) {
            return singleQuotes;
        }
        let insideSingle = singleQuotes.start.isBeforeOrEqual(s.start) && singleQuotes.end.isAfterOrEqual(s.end);
        let insideDouble = doubleQuotes.start.isBeforeOrEqual(s.start) && doubleQuotes.end.isAfterOrEqual(s.end);
        if (insideSingle && !insideDouble) {
            return singleQuotes;
        }
        if (insideDouble && !insideSingle) {
            return doubleQuotes;
        }
        if (singleQuotes.start.isBefore(doubleQuotes.start)) {
            return doubleQuotes;
        }
        return singleQuotes;
    });
}
function charRange(p) {
    let end_pos = new vscode.Position(p.line, p.character + 1);
    return new vscode.Selection(p, end_pos);
}
const switchables = ['"', "'"];
function switchQuotes() {
    let editor = vscode.window.activeTextEditor;
    let original_sel = editor.selections;
    selectEitherQuote();
    if (!editor) {
        return;
    }
    ;
    let doc = editor.document;
    let sel = editor.selections;
    sel.map((s) => {
        if (s.start.isEqual(s.end)) {
            return;
        }
        //expand selection if needed
        var expand = switchables.indexOf(doc.getText(charRange(s.start))) === -1 ? 1 : 0;
        let start_pos = new vscode.Position(s.start.line, s.start.character - expand);
        let end_pos = new vscode.Position(s.end.line, s.end.character + expand - 1);
        s = new vscode.Selection(start_pos, end_pos);
        var char = doc.getText(charRange(s.start));
        var edit = new vscode.WorkspaceEdit();
        edit.replace(doc.uri, charRange(s.start), char == '"' ? "'" : '"');
        vscode.workspace.applyEdit(edit);
        edit.replace(doc.uri, charRange(s.end), char == '"' ? "'" : '"');
        vscode.workspace.applyEdit(edit);
        doc.getText();
    });
    // restore orignal selection
    editor.selections = original_sel;
}
function matchingSelect({ start_char, end_char, outer = false }) {
    let editor = vscode.window.activeTextEditor;
    if (!editor) {
        return;
    }
    ;
    let doc = editor.document;
    let sel = editor.selections;
    let success = false;
    let start_offset = outer ? start_char.length : 0;
    let end_offset = outer ? end_char.length : 0;
    editor.selections = sel.map(s => {
        let { line, character } = s.active;
        let starts = findOccurances(doc, line, start_char);
        let ends = findOccurances(doc, line, end_char);
        let start = starts.find(a => a > character);
        let end = ends.find(a => a > character);
        let start_index = starts.indexOf(start);
        let end_index = ends.indexOf(end);
        let start_pos = findPrevious(doc, line, start_char, character, end_char) || new vscode.Position(line, starts[start_index]);
        if (!start_pos) {
            return s;
        }
        ;
        let end_pos = findNext(doc, start_pos.line, end_char, start_pos.character + 1, start_char);
        if (start_pos && end_pos) {
            success = true;
            //Automatically grow to outer selection
            if (!outer &&
                start_pos.isEqual(s.anchor) &&
                new vscode.Position(end_pos.line, end_pos.character - 1).isEqual(s.end)) {
                start_offset = start_char.length;
                end_offset = end_char.length;
            }
            start_pos = new vscode.Position(start_pos.line, start_pos.character - start_offset);
            end_pos = new vscode.Position(end_pos.line, end_pos.character - 1 + end_offset);
            return new vscode.Selection(start_pos, end_pos);
        }
        return s;
    });
    if (success && start_char === "<") {
        vscode.commands.executeCommand("editor.action.addSelectionToNextFindMatch");
    }
}
//# sourceMappingURL=extension.js.map