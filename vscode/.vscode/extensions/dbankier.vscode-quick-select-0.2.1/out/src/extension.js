// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
var vscode = require('vscode');
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    var _ = undefined;
    context.subscriptions.push(vscode.commands.registerCommand('extension.selectDoubleQuote', singleSelect.bind(_, { char: '"' })));
    context.subscriptions.push(vscode.commands.registerCommand('extension.selectSingleQuote', singleSelect.bind(_, { char: "'" })));
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
function findOccurances(doc, line, char) {
    var content = doc.lineAt(line);
    var matches = (content.text + "hack").split(char).reduce(function (acc, p) {
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
function findNext(doc, line, char, start_index, nest_char, nested) {
    if (start_index === void 0) { start_index = 0; }
    if (nest_char === void 0) { nest_char = undefined; }
    if (nested === void 0) { nested = 0; }
    if (line === doc.lineCount) {
        return undefined;
    }
    ;
    var occurances = findOccurances(doc, line, char).filter(function (n) { return n >= start_index; });
    var nests = nest_char ? findOccurances(doc, line, nest_char).filter(function (n) { return n >= start_index; }) : [];
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
function findPrevious(doc, line, char, start_index, nest_char, nested) {
    if (nest_char === void 0) { nest_char = undefined; }
    if (nested === void 0) { nested = 0; }
    if (line === -1) {
        return undefined;
    }
    ;
    if (start_index === undefined) {
        start_index = doc.lineAt(line).text.length;
    }
    var occurances = findOccurances(doc, line, char).filter(function (n) { return n <= start_index; });
    var nests = nest_char ? findOccurances(doc, line, nest_char).filter(function (n) { return n <= start_index; }) : [];
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
function singleSelect(_a) {
    var char = _a.char, _b = _a.outer, outer = _b === void 0 ? false : _b, _c = _a.multiline, multiline = _c === void 0 ? false : _c;
    var editor = vscode.window.activeTextEditor;
    if (!editor) {
        return;
    }
    ;
    var doc = editor.document;
    var sel = editor.selections;
    var offset = outer ? char.length : 0;
    editor.selections = sel.map(function (s) {
        var _a = s.active, line = _a.line, character = _a.character;
        var matches = findOccurances(doc, line, char);
        var next = matches.find(function (a) { return a > character; });
        var next_index = matches.indexOf(next);
        if (matches.length > 1 && matches.length % 2 === 0) {
            if (next === -1) {
                return s;
            }
            if (next_index % 2 !== 0) {
                next_index--;
            }
            return new vscode.Selection(new vscode.Position(line, matches[next_index] - offset), new vscode.Position(line, matches[next_index + 1] - 1 + offset));
        }
        else if (multiline) {
            var start_pos = findPrevious(doc, line, char, character) || new vscode.Position(line, matches[next_index]);
            if (!start_pos) {
                return s;
            }
            ;
            var end_pos = findNext(doc, start_pos.line, char, start_pos.character + 1);
            if (start_pos && end_pos) {
                start_pos = new vscode.Position(start_pos.line, start_pos.character - offset);
                end_pos = new vscode.Position(end_pos.line, end_pos.character - 1 + offset);
                return new vscode.Selection(start_pos, end_pos);
            }
        }
        return s;
    });
}
function matchingSelect(_a) {
    var start_char = _a.start_char, end_char = _a.end_char, _b = _a.outer, outer = _b === void 0 ? false : _b;
    var editor = vscode.window.activeTextEditor;
    if (!editor) {
        return;
    }
    ;
    var doc = editor.document;
    var sel = editor.selections;
    var success = false;
    var start_offset = outer ? start_char.length : 0;
    var end_offset = outer ? end_char.length : 0;
    editor.selections = sel.map(function (s) {
        var _a = s.active, line = _a.line, character = _a.character;
        var starts = findOccurances(doc, line, start_char);
        var ends = findOccurances(doc, line, end_char);
        var start = starts.find(function (a) { return a > character; });
        var end = ends.find(function (a) { return a > character; });
        var start_index = starts.indexOf(start);
        var end_index = ends.indexOf(end);
        var start_pos = findPrevious(doc, line, start_char, character, end_char) || new vscode.Position(line, starts[start_index]);
        if (!start_pos) {
            return s;
        }
        ;
        var end_pos = findNext(doc, start_pos.line, end_char, start_pos.character + 1, start_char);
        if (start_pos && end_pos) {
            success = true;
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