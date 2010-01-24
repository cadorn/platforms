

function dump(obj) { print(require('test/jsdump').jsDump.parse(obj)) };

var LOCATOR = require("package/locator", "http://registry.pinf.org/cadorn.org/github/pinf/packages/common/");
var BUILDER = require("builder", "http://registry.pinf.org/cadorn.org/github/pinf/packages/common/");

var Builder = exports.Builder = function(pkg, options) {
    if (!(this instanceof exports.Builder))
        return new exports.Builder(pkg, options);
    this.construct(pkg, options);
}

Builder.prototype = BUILDER.Builder();



Builder.prototype.build = function(pkg, options) {

    var descriptor = this.pkg.getDescriptor(),
        locator = this.getLocatorForSpec(descriptor.spec.using.narwhal),
        narwhalPackage = this.getPackageForLocator(locator),
        sourceBasePath = narwhalPackage.getPath(),
        sourcePath,
        targetBasePath = options.path,
        targetPath,
        basename;

    // TODO: Take OS into account when copying OS specific files

    
    targetPath = targetBasePath.join("bin");
    sourcePath = sourceBasePath.join("bin");
    [
        "js",
        "json",
        "narwhal",
        "sea",
        "tusk"
    ].forEach(function(basename) {
        targetPath.join(basename).dirname().mkdirs();
        sourcePath.join(basename).symlink(targetPath.join(basename));
        targetPath.join(basename).chmod(0755);
    });
    targetPath = targetBasePath.join("bin", "activate.bash");
    targetPath.write([
        "export PACKAGE_HOME=" + targetBasePath.valueOf(),
        "export SEA=\"$PINF_WORKSPACE_HOME\"",
        "export PATH=" + targetBasePath.join("bin").valueOf() + ":\"$PATH\""
    ].join("\n"));
    targetPath.chmod(0755);


    targetPath = targetBasePath;
    sourcePath = sourceBasePath;
    [
        "engines",
        "lib",
        "packages/readline",
        "tests",
        "narwhal.js",
        "package.json"
    ].forEach(function(basename) {
        targetPath.join(basename).dirname().mkdirs();
        sourcePath.join(basename).symlink(targetPath.join(basename));
    });

}
