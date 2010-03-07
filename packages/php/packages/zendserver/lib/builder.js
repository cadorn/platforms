

function dump(obj) { print(require('test/jsdump').jsDump.parse(obj)) };

var LOCATOR = require("package/locator", "http://registry.pinf.org/cadorn.org/github/pinf/packages/common/");
var BUILDER = require("builder", "http://registry.pinf.org/cadorn.org/github/pinf/packages/common/");
var FILE = require("file");


var Builder = exports.Builder = function(pkg, options) {
    if (!(this instanceof exports.Builder))
        return new exports.Builder(pkg, options);
    this.construct(pkg, options);
}

Builder.prototype = BUILDER.Builder();



Builder.prototype.build = function(targetPackage, buildOptions) {

    var targetBasePath = targetPackage.getPath(),
        sourcePath,
        targetPath;
    
    var config = exports.loadConfig();

    sourcePath = FILE.Path(config.PhpBinPath);
    targetPath = targetBasePath.join("bin", "php-cli");
    targetPath.dirname().mkdirs();
    sourcePath.symlink(targetPath);
    targetPath.chmod(0755);
}



exports.loadConfig = function() {
    
    var path;

    // UNIX, Mac
    FILE.Path("/etc").glob("zce.rc*").forEach(function(item) {
        if(path) return;    // use the first returned file from the glob
        path = FILE.Path(item);
    });

    if(!path) return false;
    var data = path.read().toString();
    if(!data) {
        throw new Error("No config data in file: " + path);
    }
    var config = {},
        m;
    data.split("\n").forEach(function(line) {
        if(m = line.match(/(export )?([^=]*)=(.*)/)) {
            switch(m[2]) {
                case "ZCE_PREFIX":
                    config['ZendServerPath'] = m[3];
                    config['PhpIniPath'] = FILE.Path(config["ZendServerPath"]).join("etc", "php.ini").valueOf();
                    config['PhpConfDPath'] = FILE.Path(config["ZendServerPath"]).join("etc", "conf.d").valueOf();
                    config['PhpBinPath'] = FILE.Path(config["ZendServerPath"]).join("bin", "php-cli").valueOf();
                    break;
                case "APACHE_HTDOCS":
                    config["ApacheHtdocsPath"] = m[3];
                    config['ApacheConfDPath'] = FILE.Path(config["ApacheHtdocsPath"]).dirname().join("conf.d").valueOf();
                    break;
                case "APACHE_PORT":
                    config["ApachePort"] = m[3];
                    break;
                    
            }
        }
    });
    
    if(!config['PhpBinPath']) {
        throw new Error("Could not parse 'PhpBinPath' from file: " + path);
    }
    
    return config;
}
