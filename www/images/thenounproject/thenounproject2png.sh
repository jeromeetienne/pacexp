#!/bin/sh

SRC_FNAME=$1

#GEOMETRY=64x64
GEOMETRY=80x80
#GEOMETRY=128x128

convert $SRC_FNAME -negate -transparent "#000000" -blur 4 -resize $GEOMETRY result.png