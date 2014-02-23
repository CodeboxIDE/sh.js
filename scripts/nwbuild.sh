#!/bin/bash

SCRIPTPATH=$(cd -P -- "$(dirname -- "$0")" && pwd -P)

NW_VERSION=$1
NW_VERSION=${NW_VERSION:=0.8.0}
REBUILD_MODULES=("pty.js")

echo $NW_VERSION
function rebuild_module () {
  bash -c "cd $1 && $SCRIPTPATH/../node_modules/nw-gyp/bin/nw-gyp.js rebuild --target=$NW_VERSION"
}

for module in ${REBUILD_MODULES[@]}; do
  rebuild_module node_modules/$module
done