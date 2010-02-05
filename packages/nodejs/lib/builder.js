

function dump(obj) { print(require('test/jsdump').jsDump.parse(obj)) };

var LOCATOR = require("package/locator", "http://registry.pinf.org/cadorn.org/github/pinf/packages/common/");
var BUILDER = require("builder", "http://registry.pinf.org/cadorn.org/github/pinf/packages/common/");
var PINF = require("pinf", "http://registry.pinf.org/cadorn.org/github/pinf/packages/common/");
var OS = require("os");


var Builder = exports.Builder = function(pkg, options) {
    if (!(this instanceof exports.Builder))
        return new exports.Builder(pkg, options);
    this.construct(pkg, options);
}

Builder.prototype = BUILDER.Builder();



Builder.prototype.build = function(pkg, options) {

    var targetBasePath = options.path,
        sourcePath,
        targetPath;

    var nodejsLocator = LOCATOR.PackageLocator({
            "location": "http://github.com/ry/node/zipball/v0.1.26"
        }),
        nodejsPackage = PINF.getPackageForLocator(nodejsLocator);

    // instead of compiling in the platform package we do so in a build package.
    // this allows updating the platform without needing to recompile.

    var vendorBasePath = PINF.getDatabase().getBuildPathForPackage(nodejsPackage).join("vendor");
    vendorBasePath.dirname().mkdirs();

    // check if we need to compile
    // TODO: Add support to PINF to locate build packages for given OS so we don't need to
    //       compile unless specifically requested.
    if(!vendorBasePath.join("build").exists()) {
        try {

            // copy node to "vendor" folder
            OS.command("cp -Rf " + nodejsPackage.getPath() + " " + vendorBasePath);

            OS.command("chmod u+x " + vendorBasePath.join("configure"));
            OS.command("chmod u+x " + vendorBasePath.join("tools", "waf-light"));
            OS.command("chmod u+x " + vendorBasePath.join("deps", "udns", "configure"));

            // compile node
            // TODO: Show progress upon request (-v flag?)
            OS.command("cd " + vendorBasePath + " ; ./configure ; make");

        } catch(e) {
            // the build failed
            OS.command("rm -Rf " + vendorBasePath.valueOf());
            throw e;
        }
    }

    sourcePath = vendorBasePath.join("build", "default", "node");
    targetPath = targetBasePath.join("bin", "node");
    targetPath.dirname().mkdirs();

    sourcePath.symlink(targetPath);
    targetPath.chmod(0755);
}
