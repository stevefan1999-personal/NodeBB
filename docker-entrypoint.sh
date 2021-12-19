#!/bin/sh

export BASE_DIR=/usr/src/app/base
export USER_DIR=/mnt/nodebb/user-dir

mkdir -p /usr/src/app/merged $USER_DIR/_data $USER_DIR/work
fuse-overlayfs -o lowerdir=$BASE_DIR,upperdir=$USER_DIR/_data,workdir=$USER_DIR/work /usr/src/app/merged

cd /usr/src/app/merged
./nodebb build
./nodebb start