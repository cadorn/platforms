

function dump(obj) { print(require('test/jsdump').jsDump.parse(obj)) };

/**
 * @pinf.implements http://registry.pinf.org/cadorn.org/github/pinf/packages/common/@meta/platform/macros/0.1.0
 */

var PINF = require("pinf", "http://registry.pinf.org/cadorn.org/github/pinf/packages/common/");
var JSON = require("json");


exports.expandMacros = function(context, contents) {

    contents = contents.replace(/\/\*PINF_MACRO\[PHPShebang\]\*\//g, [
        "#!/usr/bin/env " + context.platform.getPath().join("bin", "php-cli").valueOf()
    ].join("\n"));

    if(/\/\*PINF_MACRO\[LoadCommandEnvironment\]\*\//.test(contents)) {
        
        var pkg = context.targetPackage.getControlPackage();
        if(context.testPackage) pkg = context.testPackage;

        // collect all dependencies (recursively) for package
        var mappings = context.platform.getPackageStore().deepMappingsForPackage(pkg);
        if(!mappings) mappings = [];
        var extraPackages = {
            "system": [
                {
                    "path": pkg.getPath().valueOf(),
                    "locator": pkg.getLocator().getSpec()
                }
            ]
        };
        mappings.forEach(function(info) {
            var type = info[2];

            if(type=="using") return;   // for now

            if(type=="platform" || type=="dependency") type = "system";
            if(!extraPackages[type]) extraPackages[type] = [];
            extraPackages[type].push({
                "path": info[1],
                "locator": info[0]
            });
        });
        

        // TODO: Generate a native PHP structure vs JSON encoding the extraPackages
        contents = contents.replace(/\/\*PINF_MACRO\[LoadCommandEnvironment\]\*\//g, [
            "ModularPHP_Bootstrap::SetOption('pinfHomePath', '" + PINF.getDatabase().getPath() + "');",
            "ModularPHP_Bootstrap::Program(",
            "    '" + context.targetPackage.getPath().valueOf() + "',",
            "    '" + context.targetPackage.getName() + "',",
            "    json_decode('" + JSON.encode(extraPackages).replace(/'/g, "\\'") + "', true)",
            ");"
        ].join("\n"));
    }

    return contents;
}
