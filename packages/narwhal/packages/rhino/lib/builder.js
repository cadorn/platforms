

function dump(obj) { print(require('test/jsdump').jsDump.parse(obj)) };

var LOCATOR = require("package/locator", "http://registry.pinf.org/cadorn.org/github/pinf/packages/common/");
var BUILDER = require("builder", "http://registry.pinf.org/cadorn.org/github/pinf/packages/common/");
var PINF = require("pinf", "http://registry.pinf.org/cadorn.org/github/pinf/packages/common/");


var Builder = exports.Builder = function(pkg, options) {
    if (!(this instanceof exports.Builder))
        return new exports.Builder(pkg, options);
    this.construct(pkg, options);
}

Builder.prototype = BUILDER.Builder();



Builder.prototype.build = function(targetPackage, buildOptions) {

    var self = this,
        descriptor = this.pkg.getDescriptor(),
        locator = this.getLocatorForSpec(descriptor.spec.using.narwhal),
        narwhalPackage = this.getPackageForLocator(locator),
        sourceBasePath = narwhalPackage.getPath(),
        sourcePath,
        targetBasePath = targetPackage.getPath(),
        targetPath,
        basename;

    // TODO: Take OS into account when copying OS specific files

    targetPath = targetBasePath.join("bin", "narwhal");
    targetPath.dirname().mkdirs();
    targetPath.write([
        "#!/bin/bash",
        "export NARWHAL_HOME=" + targetBasePath.join("vendor").valueOf(),
        "export PACKAGE_HOME=" + targetBasePath.join("vendor").valueOf(),
        "export NARWHAL_ENGINE=rhino",
        "exec " + targetBasePath.join("vendor", "engines", "rhino", "bin", "narwhal-rhino").valueOf() + " \"$@\""
    ].join("\n"));
    targetPath.chmod(0755);

    
    targetPath = targetBasePath.join("bin", "activate.bash");
    targetPath.dirname().mkdirs();
    targetPath.write([
        "export NARWHAL_HOME=" + targetBasePath.join("vendor").valueOf(),
        "export PACKAGE_HOME=" + targetBasePath.join("vendor").valueOf(),
        "export SEA=\"$PINF_WORKSPACE_HOME\"",
        "export PATH=" + targetBasePath.join("bin").valueOf() + ":\"$PATH\""
    ].join("\n"));
    targetPath.chmod(0755);


    targetPath = targetBasePath.join("vendor");
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
    
    
    // symlink additional packages
    
    targetPath = targetBasePath.join("vendor", "packages");
    descriptor.everyUsing(function(name, locator) {
        if(name=="narwhal") return;
        sourcePath = PINF.getPackageForLocator(locator).getPath();
        sourcePath.symlink(targetPath.join(name));
    });
    
    
    // write some more bin files
    
    targetPath = targetBasePath.join("bin", "jackup");
    targetPath.dirname().mkdirs();
    targetPath.write([
        "#!/usr/bin/env " + targetBasePath.join("bin", "narwhal").valueOf(),
        "require('jackup').main(system.args);"
    ].join("\n"));
    targetPath.chmod(0755);

}
