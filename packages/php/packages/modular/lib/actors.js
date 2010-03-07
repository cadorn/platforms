

function dump(obj) { print(require('test/jsdump').jsDump.parse(obj)) };


exports.addConfigDirectives = function(context, info) {

    if(info.type=="http://registry.pinf.org/cadorn.org/github/platforms/packages/php/@meta/schema/php-ini/0.1.0") {

        var path = context.builder.getBootstrapPath();

        // assumes builder runs first
        if(path.exists()) {
            info.directives.auto_prepend_file = {
                "value": path.valueOf(),
                "who": info.viaLocator.getSpec()
            }        
        }

        return info.directives;
    }
    return true;
}
