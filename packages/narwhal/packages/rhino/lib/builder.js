

function dump(obj) { print(require('test/jsdump').jsDump.parse(obj)) };

var BUILDER = require("builder/program", "http://registry.pinf.org/cadorn.org/github/pinf/packages/common/");
var PINF = require("pinf", "http://registry.pinf.org/cadorn.org/github/pinf/packages/common/");
var JSON = require("json");


var ProgramBuilder = exports.ProgramBuilder = function() {
    if (!(this instanceof exports.ProgramBuilder))
        return new exports.ProgramBuilder();
}

ProgramBuilder.prototype = BUILDER.ProgramBuilder();


ProgramBuilder.prototype.build = function(options) {
    
    var self = this,
        descriptor = this.sourcePackage.getDescriptor(),
        narwhalLocator = descriptor.getUsingLocatorForName("narwhal"),
        narwhalPackage = PINF.getPackageForLocator(narwhalLocator),
        sourceBasePath = narwhalPackage.getPath(),
        targetBasePath = this.targetPackage.getPath();

    var sourcePath, targetPath, basename;        

    
    // link narwhal
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
    // ensure some important commands are executable
    targetPath.join("engines/rhino/bin/narwhal-rhino").chmod(0755);

    
    // symlink additional packages
    
    targetPath = targetBasePath.join("vendor", "packages");
    descriptor.everyUsing(function(name, locator) {
        if(name=="narwhal") return;
        sourcePath = PINF.getPackageForLocator(locator).getPath();
        sourcePath.symlink(targetPath.join(name));
    });
    

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

    
    // write some more bin files
    
    targetPath = targetBasePath.join("bin", "jackup");
    targetPath.dirname().mkdirs();
    targetPath.write([
        "#!/usr/bin/env " + targetBasePath.join("bin", "narwhal").valueOf(),
        "require('jackup').main(system.args);"
    ].join("\n"));
    targetPath.chmod(0755);
}


ProgramBuilder.prototype.expandMacros = function(programPackage, contents) {

    contents = contents.replace(/\/\*PINF_MACRO\[NarwhalShebang\]\*\//g, [
        "#!/usr/bin/env " + programPackage.getPath().join("bin", "narwhal").valueOf()
    ].join("\n"));

    if(/\/\*PINF_MACRO\[LoadCommandEnvironment\]\*\//.test(contents)) {
        // collect all dependencies (recursively) for package
        var mappings = PINF.getPackageStore().deepMappingsForPackage(this.targetPackage);
        if(!mappings) {
            mappings = [];
        }
        contents = contents.replace(/\/\*PINF_MACRO\[LoadCommandEnvironment\]\*\//g, [
            "system.env.SEA = \"" + this.targetPackage.getPath().valueOf() + "\";",
            "system.sea = \"" + this.targetPackage.getPath().valueOf() + "\";",
            "var PACKAGES = require(\"packages\");",
            "PACKAGES.load([",
            "  \"" + this.targetPackage.getPath().valueOf() + "\",",
            "  \"" + programPackage.getBuildPath().join(this.getTarget(), "vendor").valueOf() + "\"",
            "]);",
            JSON.encode(mappings) + ".forEach(function(mapping) {",
            "  PACKAGES.registerUsingPackage(mapping[0], mapping[1]);",
            "});"
        ].join("\n"));
    }

    return contents;
}

