"use strict";
const fs = require('fs-extra');
const path = require('path');
const prettier_1 = require("prettier");
const vscode_1 = require("vscode");
const rootPath = vscode_1.workspace.rootPath;
const packageFile = path.join(rootPath, 'package.json');
const prettyConfig = {
    // Fit code within this line limit
    printWidth: 80,
    // Number of spaces it should use per tab
    tabWidth: 2,
    // If true, will use single instead of double quotes
    singleQuote: true,
    // Controls the printing of trailing commas wherever possible
    trailingComma: false,
    // Controls the printing of spaces inside array and objects
    bracketSpacing: true,
    // Which parser to use. Valid options are 'flow' and 'babylon'
    parser: 'babylon'
};
function checkExists(path) {
    return fs.existsSync(path);
}
exports.checkExists = checkExists;
function formatCode(content, config = prettyConfig) {
    return prettier_1.format(content, prettyConfig);
}
exports.formatCode = formatCode;
function copyFile(src, dest) {
    try {
        fs.copySync(path.resolve(src), dest);
        return true;
    }
    catch (e) {
        return false;
    }
}
exports.copyFile = copyFile;
function createFile(filePath, content, __JSON__ = false) {
    try {
        if (__JSON__) {
            fs.outputJSONSync(filePath, content);
            return true;
        }
        fs.outputFileSync(filePath, content);
        return true;
    }
    catch (err) {
        return false;
    }
}
exports.createFile = createFile;
function getAppPath() {
    const appPaths = ['app', 'src'];
    const appPath = appPaths.find(f => checkExists(path.join(rootPath, f)));
    return appPath || 'app';
}
exports.getAppPath = getAppPath;
function getBundlePath() {
    const bundlePaths = ['dist', 'out', 'bundle'];
    const bundlePath = bundlePaths.find(f => checkExists(path.join(rootPath, f)));
    return bundlePath || 'dist';
}
exports.getBundlePath = getBundlePath;
function getWebpackConfig() {
    const appPath = getAppPath();
    const bundlePath = getBundlePath();
    // update devDeps before we update webpack.
    if (!updateDevDependencies()) {
        return;
    }
    return `
    const path = require('path');

    module.exports = {
      entry: './${appPath}/index.js',
      devtool: 'source-map',
      resolve: {
        extensions: ['', '.js', '.jsx']
      },
      output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, '${bundlePath}')
      },
      module: {
        loaders: [
          {
            test: /\.js$/,
            exclude: /(node_modules|bower_components)/,
            loader: 'babel', // 'babel-loader' is also a valid name to reference
            query: {
              presets: ['es2015']
            }
          }
        ]
      }
    };
  `;
}
exports.getWebpackConfig = getWebpackConfig;
function updateDevDependencies() {
    // if we dont have a package file, then no need to update.
    if (!checkExists(packageFile)) {
        return;
    }
    const devDependencies = {
        "babel-core": "^6.21.0",
        "babel-loader": "^6.2.10",
        "babel-preset-es2015": "^6.18.0",
        "webpack": "^2.2.1"
    };
    const newPackageFile = Object.assign({}, require(packageFile), {
        devDependencies: devDependencies
    });
    return createFile(packageFile, newPackageFile, true);
}
exports.updateDevDependencies = updateDevDependencies;
//# sourceMappingURL=utils.js.map