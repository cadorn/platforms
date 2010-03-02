

function dump(obj) { print(require('test/jsdump').jsDump.parse(obj)) };

var LOCATOR = require("package/locator", "http://registry.pinf.org/cadorn.org/github/pinf/packages/common/");
var BUILDER = require("builder", "http://registry.pinf.org/cadorn.org/github/pinf/packages/common/");
var PINF = require("pinf", "http://registry.pinf.org/cadorn.org/github/pinf/packages/common/");
var JSON = require("json");
var UTIL = require("util");


var Builder = exports.Builder = function(pkg, options) {
    if (!(this instanceof exports.Builder))
        return new exports.Builder(pkg, options);
    this.construct(pkg, options);
}

Builder.prototype = BUILDER.Builder();



Builder.prototype.build = function(targetPackage, buildOptions) {
    
    var sourceBasePath = targetPackage.getPath(),
        rawBasePath = targetPackage.getBuildPath().join("raw"),
        targetBasePath = targetPackage.getBuildPath().join("program"),
        sourcePath,
        targetPath;

    targetBasePath.mkdirs();
    
    // copy package.json
    sourcePath = rawBasePath.join("package.json");
    targetPath = targetBasePath.join("package.json");
    sourcePath.copy(targetPath);


    // link raw packages
    [
        rawBasePath
//        sourceBasePath
    ].forEach(function(sourcePath) {
        sourcePath = sourcePath.join("packages");
        if(!sourcePath.exists()) return;
        targetPath = targetBasePath.join("packages");
        targetPath.mkdirs();
        sourcePath.listPaths().forEach(function(item) {
            if(item.join("package.json").exists()) {
                // only link if no UID in package descriptor
                // if a UID is present the package will end up in /using/ based on dependency declarations
                // TODO: This should be moved to /pinf/program.js
//                if(!UTIL.has(JSON.decode(item.join("package.json").read().toString()), "uid")) {
                    item.symlink(targetPath.join(item.basename()));
//                }
            }
        });
    });
    
    // link using packages
    sourcePath = rawBasePath.join("using");
    targetPath = targetBasePath.join("using");
    sourcePath.symlink(targetPath);
    
    // link program directories
    [
        "lib",
        "resources"
    ].forEach(function(path) {
        sourcePath = sourceBasePath.join(path);
        targetPath = targetBasePath.join(path);
        targetPath.dirname().mkdirs();
        sourcePath.symlink(targetPath);
    });

}
