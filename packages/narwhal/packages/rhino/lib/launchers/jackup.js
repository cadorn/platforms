

function dump(obj) { print(require('test/jsdump').jsDump.parse(obj)) };

var ARGS = require("args");
var LOCATOR = require("package/locator", "http://registry.pinf.org/cadorn.org/github/pinf/packages/common/");
var LAUNCHER = require("launcher", "http://registry.pinf.org/cadorn.org/github/pinf/packages/common/");
var PINF = require("pinf", "http://registry.pinf.org/cadorn.org/github/pinf/packages/common/");
var OS = require("os");


var Launcher = exports.Launcher = function(pkg, options) {
    if (!(this instanceof exports.Launcher))
        return new exports.Launcher(pkg, options);
    this.construct(pkg, options);
}

Launcher.prototype = LAUNCHER.Launcher();



Launcher.prototype.launch = function(targetPackage, launchOptions) {
    
    var launchPath = targetPackage.getBuildPath().join("program");
    if(!launchPath.exists()) {
        throw new Error("No program found at: " + launchPath);
    }
    
    var descriptor = targetPackage.getDescriptor();
        platformName = descriptor.getPlatform(),
        platformLocator = descriptor.getPlatformLocatorForName(platformName);
        
    var platform = PINF.getPlatformForLocator(platformLocator);
    
    var binPath = platform.getPath().join("bin", "jackup");
    if(!binPath.exists()) {
        throw new Error("jackup binary not found at: " + binPath);
    }

    var command = "export SEA=" + launchPath + "; " + binPath + " " + launchOptions.args.join(" ");
    OS.system(command);

}
