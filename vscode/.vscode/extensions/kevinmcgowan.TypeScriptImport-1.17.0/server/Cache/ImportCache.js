"use strict";
const CommonPathFinder_1 = require("./../Factory/Helper/CommonPathFinder");
const CompletionGlobals_1 = require("./../Factory/Helper/CompletionGlobals");
const CompletionItemFactory_1 = require("./../Factory/CompletionItemFactory");
class ImportCache {
    constructor() {
        /// ======================
        /// Properties
        /// ======================
        /**
         * Cache
         */
        this._namespaceCache = [];
        /**
         * Temp
         */
        this._frameworkList = [];
    }
    /// ======================
    /// Methods
    /// ======================
    /**
     * Resets everything
     */
    reset() {
        this._resetRequested = true;
    }
    /**
     * Registers a framework
     */
    registerFramework(framework) {
        if (this._resetRequested) {
            this._frameworkList = [];
            this._namespaceCache = [];
            this._cache = null;
            this._resetRequested = false;
        }
        /// Validate
        if (!this._frameworkList[framework.name]) {
            this._frameworkList[framework.name] = [];
        }
        /// Register the dependancies
        if (framework.dependancies) {
            for (let element of framework.dependancies) {
                /// We're just reading arbitrerily, so make sure that we have something to hit
                if (!this._frameworkList[element]) {
                    this._frameworkList[element] = [];
                }
                /// We add the array reference, rather than individual files
                this._frameworkList[framework.name].push(this._frameworkList[element]);
            }
        }
    }
    /**
     * Registers a namespace and method list
     */
    register(file) {
        /// Ensure the namespace exists
        if (!this._namespaceCache[file.namespace]) {
            this._namespaceCache[file.namespace] = [];
        }
        ;
        const cacheFile = {
            namespace: file.namespace,
            method: file.methods[0],
            path: file.path.replace(/(\.ts|\.js)/, ""),
            commonJS: file.commonJS
        };
        /// file.path = "/e:/2016/Web/JS/SnowStorm/src/SnowStormLauncher/src/AvatarBuilder/Events/ProgressEvent.ts"
        /// Here we add the namespace to our framework path
        for (let element in this._frameworkList) {
            if (file.path.indexOf(element) > -1) {
                this._frameworkList[element].push(cacheFile);
                break;
            }
        }
        /// Store the info in a namespace cache
        this._namespaceCache[file.namespace].push(cacheFile);
        /// Last element has been added
        file.methods.shift();
        /// If we still have any left, repeat this process. Internal exports need to be included
        if (~~file.methods.length) {
            this.register(file);
        }
    }
    /**
     * Gets items for when we're typing "import"
     */
    getOnImport(commonJsMethod, namespaceJsMethod) {
        const fullList = this.getAll();
        let method;
        if (!fullList) {
            return [];
        }
        /// TODO: This blows, surely we can use CompletionGlobals here?
        /// We're looking to find our framework to see if it's common or not
        for (let element in this._frameworkList) {
            if (~~CompletionGlobals_1.CompletionGlobals.Uri.indexOf(element)) {
                let target = this._frameworkList[element][this._frameworkList[element].length - 1];
                method = target.commonJS ? commonJsMethod : namespaceJsMethod;
                break;
            }
        }
        const list = [];
        for (let element of fullList) {
            /// Don't show hints for the current file, otherwise we end up importing into ourselves
            if (~~CompletionGlobals_1.CompletionGlobals.Uri.indexOf(element.path)) {
                list.push(method.call(CompletionItemFactory_1.CompletionItemFactory, element));
            }
        }
        return list;
    }
    /**
     * Gets a cacheFile from method name
     */
    getFromMethodName(name) {
        const fullList = this.getAll();
        /// Find our target, then link it up as required
        for (const element of fullList) {
            if (element.method === name || element.namespace === name) {
                /// Rewrite it for commonJS
                if (element.commonJS) {
                    return {
                        commonJS: true,
                        namespace: element.namespace,
                        /// ES6 vs legacy
                        path: element.method ? `{ ${element.method} } from "${CommonPathFinder_1.GetCommonJSPath(element)}";` : `${element.namespace} = require("${CommonPathFinder_1.GetCommonJSPath(element)}")`,
                        method: ""
                    };
                }
                return element;
            }
        }
        /// Not found
        return null;
    }
    /**
     * Returns all entries, including those from the framework
     */
    getAll() {
        let element;
        let list;
        let target;
        /// file.path = "/e:/2016/Web/JS/SnowStorm/src/SnowStormLauncher/src/AvatarBuilder/Events/ProgressEvent.ts"
        /// Here we add the namespace to our framework path
        for (element in this._frameworkList) {
            if (CompletionGlobals_1.CompletionGlobals.Uri.indexOf(element) > -1) {
                /// Try to return a cached value, can't do this any sooner, need the framework name
                if (this._cache && this._cache[element]) {
                    return this._cache[element];
                }
                /// Either an array or an individual file
                target = this._frameworkList[element];
                list = this._frameworkList[element].clone();
                break;
            }
        }
        /// Can't hit the cache
        /// We now loop over what's available
        for (let i = 0; i < target.length - 1; i++) {
            /// If it's an array (framework dep)
            if (target[i].length) {
                list.splice(i, 1);
                /// Concat into each other
                list = list.concat(target[i]);
            }
        }
        /// Setup the cache for this
        if (!this._cache) {
            this._cache = [];
        }
        this._cache[element] = list;
        /// Pass across
        return list;
    }
}
module.exports = ImportCache;
//# sourceMappingURL=ImportCache.js.map