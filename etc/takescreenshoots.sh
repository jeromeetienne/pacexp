#!/bin/sh
# little tool to automatically shoot screenshot
# - usefull to get good ones for promotion

# TODO 
windowId=0x2400055

while true; do
	DateStr=`date +"%Y%m%d%H%M%S"`
	dstFile=./screenshot-$DateStr.png
	echo importing window $window to $dstFile
	import -window $windowId $dstFile
	sleep 1
done