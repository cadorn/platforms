<?php

if(getenv("MODULAR_PHP_ENABLED")!="true") {
    return;
}

$file = "{PackageRootPath}".DIRECTORY_SEPARATOR.implode(array('lib','ModularPHP','Bootstrap.php'),DIRECTORY_SEPARATOR);
if(!file_exists($file)) {
    throw new Exception("Could not locate ModularPHP Core Bootstrap file!");
}
require_once($file);

ModularPHP_Bootstrap::SetOption('platformVariantName', 'zendserver');

function __mp__serviceRawRoutes() {
    
{RawRoutes}

}

if(isset($_SERVER['REQUEST_URI'])) {
    __mp__serviceRawRoutes();
}