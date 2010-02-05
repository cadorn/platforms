

function dump(obj) { print(require('test/jsdump').jsDump.parse(obj)) };

var JSON = require("json");

exports.expandMacros = function(platform, program, contents) {

    contents = contents.replace(/\/\*PINF_MACRO\[NarwhalShebang\]\*\//g, [
        "#!/usr/bin/env " + platform.getPath().join("bin", "narwhal").valueOf()
    ].join("\n"));

    if(/\/\*PINF_MACRO\[LoadCommandEnvironment\]\*\//.test(contents)) {
        // collect all dependencies (recursively) for package
        var mappings = platform.getPackageStore().deepMappingsForPackage(program);
        if(!mappings) {
            mappings = [];
        }
        contents = contents.replace(/\/\*PINF_MACRO\[LoadCommandEnvironment\]\*\//g, [
            "system.env.SEA = \"" + program.getPath().valueOf() + "\";",
            "system.sea = \"" + program.getPath().valueOf() + "\";",
            "var PACKAGES = require(\"packages\");",
            "PACKAGES.load([",
            "  \"" + program.getPath().valueOf() + "\",",
            "  \"" + platform.getPath().join("vendor").valueOf() + "\"",
            "]);",
            JSON.encode(mappings) + ".forEach(function(mapping) {",
            "  PACKAGES.registerUsingPackage(mapping[0], mapping[1]);",
            "});"
        ].join("\n"));
    }

    return contents;
}
