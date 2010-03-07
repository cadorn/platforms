
function dump(obj) { print(require('test/jsdump').jsDump.parse(obj)) };


/**
 * @pinf.implements http://registry.pinf.org/cadorn.org/github/platforms/@meta/install/helpers/0.1.0
 */

var FILE = require("file");
var BUILDER = require("./builder");


exports.locateBinary = function(context, name) {

    if(name=="php-cli") {
        return FILE.Path(BUILDER.loadConfig().PhpBinPath);
    }

}

exports.locateConfig = function(context, name) {

    if(name=="php.ini") {
        return FILE.Path(BUILDER.loadConfig().PhpIniPath);
    }

}


