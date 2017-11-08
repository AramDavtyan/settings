"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const vscode = require('vscode');
const indexToChar = i => String.fromCharCode(65 + i);
const generateLabelFromIndex = (i, labelLength) => labelLength < 2 ? indexToChar(i) : indexToChar(i / 26) + indexToChar(i % 26);
const getRangeAtPosition = (position, length = 1) => {
    return new vscode.Range(position, position.translate(0, length));
};
class Tag {
    constructor(index, characters, position, labelLength) {
        this.index = index;
        this.characters = characters;
        this.position = position;
        this.label = generateLabelFromIndex(index, labelLength);
        this.range = getRangeAtPosition(position, this.label.length);
    }
    get length() {
        return this.label.length;
    }
    matches(key) {
        return this.label[0].toLowerCase() === key.toLowerCase();
    }
}
exports.Tag = Tag;
;
(function (JumperState) {
    JumperState[JumperState["Inactive"] = 0] = "Inactive";
    JumperState[JumperState["Input"] = 1] = "Input";
    JumperState[JumperState["Jump"] = 2] = "Jump";
})(exports.JumperState || (exports.JumperState = {}));
var JumperState = exports.JumperState;
;
class Jumper {
    constructor(options) {
        this.state = JumperState.Inactive;
        this.tags = null;
        this.defaultOptions = {
            editor: null,
            numTags: 26,
            range: [-30, 30],
            decoratorOptions: {}
        };
        this.keyRegex = /[a-z]/i;
        this.config(options);
    }
    get tagLength() {
        if (!this.tags)
            return null;
        const tag = this.tags[0];
        if (!tag)
            return null;
        return tag.length;
    }
    get activeEditor() {
        return this._activeEditor || vscode.window.activeTextEditor;
    }
    config(options = {}) {
        options = Object.assign({}, this.defaultOptions, options);
        this._activeEditor = options.editor;
        this.numTags = options.numTags;
        this.range = options.range;
        this.textEditorDecorationType = vscode.window.createTextEditorDecorationType(options.decoratorOptions);
    }
    /**
     * Calculate the offset and text around a position in the editor
     *
     * @param A position in the editor
     * @return the subset text of the document around the
     * position and the offset of the position within that subset
     */
    getTextAndOffsetAroundPosition(position = this.activeEditor.selection.active) {
        const editor = this.activeEditor;
        const activePosition = editor.selection.active;
        const positionOffset = editor.document.offsetAt(activePosition);
        const startLine = activePosition.line + this.range[0] >= 0 ? activePosition.line + this.range[0] : 0;
        const start = new vscode.Position(startLine, 0);
        const startOffset = editor.document.offsetAt(start);
        const end = new vscode.Position(activePosition.line + this.range[1], 9999); // "last" character
        const range = new vscode.Range(start, end);
        const text = editor.document.getText(range);
        const offset = positionOffset - startOffset;
        return { text: text, offset: offset, startOffset: startOffset };
    }
    isValidKey(key) {
        return this.keyRegex.test(key);
    }
    /**
     * Generate tags for the editor from a key and apply them to the editor
     *
     * @param An input key
     */
    getTagsForKey(key) {
        return __awaiter(this, void 0, void 0, function* () {
            const editor = this.activeEditor;
            const { text, offset, startOffset } = this.getTextAndOffsetAroundPosition();
            const indices = [];
            // get the indices we want to put labels in
            for (let i = 0, len = text.length; i < len; i++) {
                if (text[i] === key && i !== offset) {
                    indices.push(i);
                }
            }
            if (indices.length === 0) {
                this.state = JumperState.Inactive;
                return;
            }
            const labelLength = indices.length > 26 ? 2 : 1;
            // if we have a label of length 2, we omit one out of every adjacent pair
            if (labelLength === 2) {
                for (let i = 0, len = indices.length; i < len; i++) {
                    if (indices[i + 1] - indices[i] === 1) {
                        indices.splice(i + 1, 1);
                    }
                }
            }
            const tags = indices.map((i, j) => {
                return new Tag(j, text.substr(i, labelLength), editor.document.positionAt(startOffset + i), labelLength);
            });
            return tags;
        });
    }
    /**
    * Set tags across the editor
    *
    * @param An array of tags
    */
    setTags(tags) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.tags)
                yield this.clearTags();
            if (tags.length === 0)
                return false;
            this.tags = tags;
            const didEdits = yield this.activeEditor.edit(editBuilder => {
                tags.forEach(({ range, label }) => {
                    editBuilder.replace(range, label);
                });
            });
            const ranges = tags.map(({ range }) => range);
            this.activeEditor.setDecorations(this.textEditorDecorationType, ranges);
            this.state = JumperState.Jump;
            return didEdits;
        });
    }
    /**
     * Clear all tags from the editor
     *
     * @return A boolean indicating succesful edit
     */
    clearTags() {
        return __awaiter(this, void 0, void 0, function* () {
            let didEdits = false;
            if (this.tags && this.tags.length > 0) {
                const didEdits = yield this.activeEditor.edit(editBuilder => {
                    this.tags.forEach(({ range, characters }) => {
                        editBuilder.replace(range, characters);
                    });
                });
                this.activeEditor.setDecorations(this.textEditorDecorationType, []);
                this.tags = null;
            }
            this.state = JumperState.Inactive;
            return didEdits;
        });
    }
    /**
     * Keypress behavior, after tags are set
     *
     * @param The keypress text
     */
    keypress(text) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.tagLength === 1) {
                return this.jump(text);
            }
            let newTags = this.tags
                .filter(tag => tag.matches(text))
                .map(tag => new Tag(tag.index % 26, tag.characters.slice(0, -1), tag.position, 1));
            yield this.clearTags();
            yield this.setTags(newTags);
        });
    }
    /**
    * Jump to the location indicated by the selected tag
    *
    * @param The keypress text
    */
    jump(text) {
        return __awaiter(this, void 0, void 0, function* () {
            const { tags } = this;
            const tag = tags.find(t => t.matches(text));
            if (tag) {
                this.activeEditor.revealRange(tag.range);
                this.activeEditor.selection = new vscode.Selection(tag.position, tag.position);
            }
            yield this.clearTags();
            this.state === JumperState.Inactive;
        });
    }
    ;
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Jumper;
//# sourceMappingURL=jumper.js.map