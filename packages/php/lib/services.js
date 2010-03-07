

function dump(obj) { print(require('test/jsdump').jsDump.parse(obj)) };

/**
 * @pinf.implements http://registry.pinf.org/cadorn.org/github/pinf/packages/common/@meta/platform/macros/0.1.0
 */

var PINF = require("pinf", "http://registry.pinf.org/cadorn.org/github/pinf/packages/common/");


exports.getVariations = function(platform) {
    var variations = [];
    var spec, contract_uri = "http://registry.pinf.org/cadorn.org/github/platforms/packages/php/@meta/stack/0.1.0";
    PINF.getDatabase().getPlatforms().forEach(function(platformPkg) {
        if(platformPkg.isAliased()) {
            if((spec = platformPkg.getControlPackage().getImplementsForUri(contract_uri))) {
                variations.push(platformPkg);
            }
        }
    });
    return variations;
}
