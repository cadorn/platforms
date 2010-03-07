

function dump(obj) { print(require('test/jsdump').jsDump.parse(obj)) };

var LOCATOR = require("package/locator", "http://registry.pinf.org/cadorn.org/github/pinf/packages/common/");
var BUILDER = require("builder", "http://registry.pinf.org/cadorn.org/github/pinf/packages/common/");
var PLATFORM = require("platform", "http://registry.pinf.org/cadorn.org/github/pinf/packages/common/");
var PINF = require("pinf", "http://registry.pinf.org/cadorn.org/github/pinf/packages/common/");
var JSON = require("json");
var UTIL = require("util");


var Builder = exports.Builder = function(pkg, options) {
    if (!(this instanceof exports.Builder))
        return new exports.Builder(pkg, options);
    this.construct(pkg, options);
}

Builder.prototype = BUILDER.Builder();



var configSectionName = "PINF:" + module["package"],
    configSectionRegExp = new RegExp("\\n;\\[" + configSectionName.replace(/\//g, "\\/") + "\\]\\s*\\n([\\s\\S]*)(\\n\\n|$)");



Builder.prototype.build = function(targetPackage, options) {
    var self = this;

    // only build if we are building a platform package
    if(!(targetPackage instanceof PLATFORM.Platform)) {
        return;
    }

    // for each platform that implement the stack contract
    var variables, contract_uri = "http://registry.pinf.org/cadorn.org/github/platforms/packages/php/@meta/stack/0.1.0";
    exports.forEachImplementingPlatform(contract_uri, function(pkg, spec) {

        variables = {
            "stackPackage": pkg,
            "targetPackage": targetPackage,
            "options": options,
            "platformPath": options.path,
        };
        variables["phpPath"] = callHelper(variables.stackPackage, "locateBinary", ["php-cli"], "http://registry.pinf.org/cadorn.org/github/platforms/@meta/install/helpers/0.1.0"),
        variables["phpIniPath"] = callHelper(variables.stackPackage, "locateConfig", ["php.ini"], "http://registry.pinf.org/cadorn.org/github/platforms/@meta/install/helpers/0.1.0")
        variables["autoPrependPath"] = variables.platformPath.join("lib", "bootstrap.php");
        
        try {
            self.unhook(variables);
            self.hook(variables);
        } catch(e) {
            self.unhook(variables);
            throw e;
        }
    });
    if(!variables) {
        throw new Error("No platform found which implements: " + contract_uri);
    }
}    
    
Builder.prototype.hook = function(scope) {

    // add directives to php.ini file 

    var phpIniDirectives = {};
    var contract_uri = "http://registry.pinf.org/cadorn.org/github/platforms/@meta/install/actors/0.1.0";
    exports.forEachImplementingPlatform(contract_uri, function(pkg, spec) {

        callHelper(pkg, "addConfigDirectives", [
            {
                "type": "http://registry.pinf.org/cadorn.org/github/platforms/packages/php/@meta/schema/php-ini/0.1.0",
                "targetPackage": scope.targetPackage,
                "viaLocator": pkg.getLocator(),
                "directives": phpIniDirectives,
            }
        ], spec);

    }, [scope.targetPackage]);

    this.util.backupFile(scope.phpIniPath);

    var contents = UTIL.trimEnd(scope.phpIniPath.read().toString());
    // always add to end of file
    contents += "\n\n" + ";[" + configSectionName + "]\n";

    if(UTIL.len(phpIniDirectives)>0) {

        UTIL.every(phpIniDirectives, function(directive) {
            contents += ";who=" + JSON.encode(directive[1].who) + "\n";
            contents += directive[0] + "=" + directive[1].value + "\n";
        });
    }
        
    this.util.accessPrivilegedFile(scope.phpIniPath, function(path) {
        path.write(contents);
    });
}


Builder.prototype.unhook = function(scope) {

    this.util.backupFile(scope.phpIniPath);

    // remove previous directives from php.ini file 
    this.util.accessPrivilegedFile(scope.phpIniPath, function(path) {
        var contents = path.read().toString();
        var m = configSectionRegExp.exec(contents);
        if(m) {
            path.write(contents.replace(m[0], ""));
        }
    });

}




exports.forEachImplementingPlatform = function(contract_uri, callback, extraPlatforms) {
    var spec, visited = {};

    PINF.getDatabase().getPlatforms().forEach(function(platform) {
        visit(platform.getControlPackage());
    });
    
    (extraPlatforms || []).forEach(function(platform) {
        visit(platform.getControlPackage());
    });
    
    function visit(platformPkg) {
        if(visited[platformPkg.getPath().valueOf()]) return;

        // traverse all platform dependencies first
        platformPkg.getDescriptor().traverseEveryUsing(function(pkg) {
            if(visited[pkg.getPath().valueOf()]) return;
            if((spec = pkg.getImplementsForUri(contract_uri))) {
                callback(platformPkg, spec);
            }
            visited[pkg.getPath().valueOf()] = true;
        }, {
            "packageStore": PINF.getDatabase().getPackageStore(),
            "package": platformPkg
        });

        if(visited[platformPkg.getPath().valueOf()]) return;

        if((spec = platformPkg.getImplementsForUri(contract_uri))) {
            callback(platformPkg, spec);
        }
        visited[platformPkg.getPath().valueOf()] = true;
    }
}



function callHelper(targetPackage, funcName, args, uri) {
    var spec;
    if(typeof uri == "string") {
        spec = targetPackage.getImplementsForUri(uri);
    } else {
        spec = uri;
    }
    if(!spec || !spec.module) return false;

    targetPackage.makeCallable();

    var module = require(spec.module, targetPackage.getTopLevelId());
    if(!module[funcName]) return false;

    return module[funcName].apply(null, [
        {
            "builder": targetPackage.getBuilder()
        }
    ].concat(args));
}

