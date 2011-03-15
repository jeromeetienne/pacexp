#!/usr/bin/make
# to automatize repeatitive actions

PROJECT_NAME=jsbattle


clean	: brequire_clean

build	: homepage_build brequire_build doc_build 

test	: jshint

doc	: doc_build

#################################################################################
#		misc								#
#################################################################################

HTML_TITLE=jsbattle - the war of the bot
homepage_build:
	pandoc -A ~/.pandoc.header.html README.md -o index.html
	sed -i "s/github.com\/you/github.com\/jeromeetienne\/$(PROJECT_NAME)/g" index.html
	sed -i 's/<title><\/title>/<title>$(HTML_TITLE)<\/title>/g' index.html

jshint	:
	jshint lib/*.js

doc_build:
	dox --title "jsbattle - the war of the bots"			\
		--desc "coders vs coders figthing over tank bots"	\
		lib/*.js > doc/index.html

#################################################################################
#		brequire							#
#################################################################################

brequire_build:
	brequire lib www/brequired

brequire_clean:
	rm -f www/brequired/*.js
	
brequire_monitor: brequire_build
	(while inotifywait -r -e modify,attrib,create lib ; do make brequire_build; done)

#################################################################################
#		deploy								#
#################################################################################

deploy:	deployDedixl

deployDedixl:
	rsync -avz --rsh=ssh --exclude .git --exclude www/vendor/three.js/.git . dedixl:public_html/webymaze
