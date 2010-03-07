

function dump(obj) { print(require('test/jsdump').jsDump.parse(obj)) };

var LOCATOR = require("package/locator", "http://registry.pinf.org/cadorn.org/github/pinf/packages/common/");
var BUILDER = require("builder", "http://registry.pinf.org/cadorn.org/github/pinf/packages/common/");
var PLATFORM = require("platform", "http://registry.pinf.org/cadorn.org/github/pinf/packages/common/");
var PINF = require("pinf", "http://registry.pinf.org/cadorn.org/github/pinf/packages/common/");
var FILE = require("file");
var TEMPLATE = require("template", "template");
var UTIL = require("util");
var URI = require("uri");


var Builder = exports.Builder = function(pkg, options) {
    if (!(this instanceof exports.Builder))
        return new exports.Builder(pkg, options);
    this.construct(pkg, options);
}

Builder.prototype = BUILDER.Builder();



Builder.prototype.prepare = function(targetPackage, options) {
    var self = this;

    // only build if we are building a platform package
    if(!(targetPackage instanceof PLATFORM.Platform)) {
        return;
    }

    // check all platforms for "implements" declarations (including platform being installed)
    // TODO: check all platform dependencies for implements declarations
    var uri = "http://registry.pinf.org/cadorn.org/github/pinf/@meta/routing/url/0.1.0",
        mappings = [];
    var platforms = PINF.getDatabase().getPlatforms(),
        visited = [],
        spec;
    platforms.forEach(function(platform) {
        if(visited[platform.getName()]) return;
        visited[platform.getName()] = true;
        if((spec = platform.getControlPackage().getDescriptor().getImplementsForUri(uri)) && spec.mappings) {
            mappings.push([spec.mappings, platform.getControlPackage()]);
        }
    });
    if((spec = targetPackage.getControlPackage().getDescriptor().getImplementsForUri(uri)) && spec.mappings) {
        if(!visited[targetPackage.getName()]) {
            mappings.push([spec.mappings, targetPackage.getControlPackage()]);
        }
    }
    var routes = [];
    mappings.forEach(function(info) {
        // TODO: move this logic to the PINF package
        UTIL.every(info[0], function(mapping) {
            var uri = URI.parse(mapping[0]);

            var impl = require(mapping[1].module, info[1].getTopLevelId());
            if(!impl) {
                throw new Error("Could not require implementing module '" + mapping[1].module + "' for mapping in: " + info[1].getTopLevelId());
            }
            if(impl.normalizeUrl) {
                uri = impl.normalizeUrl({
                    "targetPackage": targetPackage,
                    "builder": self
                }, uri);
                if(!(uri instanceof URI.URI)) uri = URI.parse(uri);
            }
            // TODO: get the implementations during a second pass to allow other implementers to modify URL as well?
            if(impl.getImplementation) {
                routes.push(impl.getImplementation({
                    "targetPackage": targetPackage,
                    "builder": self
                }, uri));
            }
        });
    });

    this.writeBootstrapFile(this.getBootstrapPath(targetPackage), {
        "RawRoutes": routes.join("\n")
    });
}



Builder.prototype.build = function(targetPackage, options) {

}


Builder.prototype.writeBootstrapFile = function(targetPath, vars) {

    vars = vars || {};
    vars["PackageRootPath"] = PINF.getPackageForLocator(this.pkg.getDescriptor().getUsingLocatorForName("modular-php-core")).getPath().valueOf();

    var template = new TEMPLATE.Template(FILE.Path(module.path).dirname().join("../tpl/Bootstrap.inc.php").read().toString());
    contents = template.render(vars);
    targetPath.dirname().mkdirs();
    targetPath.write(contents);
}

Builder.prototype.getBootstrapPath = function() {
    var path = PINF.getDatabase().getBuildPathForPackage(this.pkg);
    return path.join("lib", "Bootstrap.inc.php");
}
