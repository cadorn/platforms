
PINF Platforms
==============

This project contains a bunch of [PINF](http://github.com/cadorn/pinf) platforms to form the foundation
of a PINF-based toolchain. Ideally all related platforms will depend on these. The current architecture
and coupling has evolved in the context of a few projects and a thorough review and overhaul will be conducted
once we have wider use.

  * **[narwhal-rhino](http://narwhaljs.org/platforms.html)**: http://registry.pinf.org/cadorn.org/github/platforms/packages/narwhal/packages/rhino/

    <locator> ~ {
        "catalog": "http://registry.pinf.org/cadorn.org/github/platforms/packages/narwhal/packages/catalog.json",
        "name": "rhino",
        "revision": "master"
    }    

  * **[nodejs](http://www.nodejs.org/)**: http://registry.pinf.org/cadorn.org/github/platforms/packages/nodejs/
  
    <locator> ~ {
        "catalog": "http://registry.pinf.org/cadorn.org/github/platforms/packages/catalog.json",
        "name": "nodejs",
        "revision": "master"
    }

  * **[modular-php](http://github.com/cadorn/modular-php)**: http://registry.pinf.org/cadorn.org/github/platforms/packages/php/packages/modular/

    <locator> ~ {
        "catalog": "http://registry.pinf.org/cadorn.org/github/platforms/packages/php/packages/catalog.json",
        "name": "modular",
        "revision": "master"
    }
  
  * **[ZendServer](http://www.zend.com/en/products/server-ce/)**: http://registry.pinf.org/cadorn.org/github/platforms/packages/php/packages/zendserver/

    <locator> ~ {
        "catalog": "http://registry.pinf.org/cadorn.org/github/platforms/packages/php/packages/catalog.json",
        "name": "zendserver",
        "revision": "master"
    }

Install
=======

As a workspace package dependency:

    "pinf": {
        "platforms": {
            "<alias>": <locator>
        },
        "platform": "<alias>"
    }

As a package command dependency:

    "pinf": {
        "platforms": {
            "<alias>": <locator>
        },
        "commands": {
            "<name>": {
                "path": "bin/<module>",
                "platform": "<alias>"
            }
        }
    }

As an ad-hock/custom platform:

    pinf install-platform --name <alias> <catalog> <name> <revison>
    pinf activate-platform <workspace> <alias>



License
=======

**NOTE: Each platform may pull in third party code under different licensing terms.**

[MIT License](http://www.opensource.org/licenses/mit-license.php)

Copyright (c) 2009-2010 Christoph Dorn

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
