#!/bin/bash

export CONFIG_DIR=/opt/config

mkdir -p $CONFIG_DIR
chmod 777 -R $CONFIG_DIR

[[ -f $CONFIG_DIR/config.json ]] || touch $CONFIG_DIR/config.json
[[ -f $CONFIG_DIR/package.json ]] || cp install/package.json $CONFIG_DIR/package.json

ln -s $CONFIG_DIR/package.json package.json
ln -s $CONFIG_DIR/config.json config.json

npm install --only=prod
npm cache clean --force

./nodebb build
./nodebb start