

function dump(obj) { print(require('test/jsdump').jsDump.parse(obj)) };

/**
 * @pinf.implements http://registry.pinf.org/cadorn.org/github/pinf/packages/common/@meta/platform/services/0.1.0
 */


var JSON = require("json");

exports.expandMacros = function(context, contents) {

    contents = contents.replace(/\/\*PINF_MACRO\[NarwhalShebang\]\*\//g, [
        "#!/usr/bin/env " + context.platform.getPath().join("bin", "narwhal").valueOf()
    ].join("\n"));

    if(/\/\*PINF_MACRO\[LoadCommandEnvironment\]\*\//.test(contents)) {
        // collect all dependencies (recursively) for package
        var mappings = context.platform.getPackageStore().deepMappingsForPackage(context.targetPackage);
        if(!mappings) {
            mappings = [];
        }
        contents = contents.replace(/\/\*PINF_MACRO\[LoadCommandEnvironment\]\*\//g, [
            "system.env.SEA = \"" + context.targetPackage.getPath().valueOf() + "\";",
            "system.sea = \"" + context.targetPackage.getPath().valueOf() + "\";",
            "var PACKAGES = require(\"packages\");",
            "PACKAGES.load([",
            "  \"" + context.targetPackage.getPath().valueOf() + "\",",
            "  \"" + context.platform.getPath().join("vendor").valueOf() + "\"",
            "]);",
            JSON.encode(mappings) + ".forEach(function(mapping) {",
            "  PACKAGES.registerUsingPackage(mapping[0], mapping[1]);",
            "});"
        ].join("\n"));
    }

    return contents;
}
