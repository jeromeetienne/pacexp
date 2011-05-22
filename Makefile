#!/usr/bin/make
# to automatize repeatitive actions

PROJECT_NAME=pacmaze
PROJECT_ENV=dev
PROJECT_VERSION=3
PROJECT_LATEST_VERSION=3

SHORTTAGJS=../shorttag.js/bin/node-shorttag


server_dev:
	supervisor -w lib lib/serverMain.js

server_prod:
	while true; do sleep 1; node lib/server.js; done

build: release_build

clean: release_clean jsdoc_clean brequire_clean

install: upstart_install

uninstall: upstart_uninstall

#################################################################################
#		release								#
#################################################################################

release_build: release_clean build/index.html
	echo "*" > build/.gitignore
	#inliner http://localhost/~jerome/webwork/pacexp/www/index.html > build/index.html
	cp -a www/sounds build
	cp -a www/images build
	cp www/images/favicon.ico build
	cp etc/apache2/htaccess build/.htaccess
	mkdir -p build/vendor/soundmanager2/swf
	cp -a www/vendor/soundmanager2/swf/*.swf build/vendor/soundmanager2/swf
	mkdir -p build/vendor/socket.io-client/lib/vendor/web-socket-js/
	cp www/vendor/socket.io-client/lib/vendor/web-socket-js/*.swf -d build/vendor/socket.io-client/lib/vendor/web-socket-js/
	unzip www/vendor/socket.io-client/lib/vendor/web-socket-js/WebSocketMainInsecure.zip -d build/vendor/socket.io-client/lib/vendor/web-socket-js/
	#echo "CACHE MANIFEST\nCACHE:\n" > build/cache.manifest
	#(cd build && find . -type f | grep -v .bw | grep -v Hot | grep -v .ogg| grep -v .htaccess) | sed 's/ /%20/' >> build/cache.manifest
	#echo "\nNETWORK:\n*\n" > build/cache.manifest
	#(cd build && find . -type f | grep -v .bw | grep -v Hot | grep -v .ogg| grep -v .htaccess) | sed 's/ /%20/' >> build/cache.manifest

release_clean:
	rm -rf build/*

build/index.html: www/index_prod.html
	inliner http://localhost/~jerome/webwork/pacexp/www/index_prod.html > build/index.html

index_build:
	echo "<? PROJECT_ENV = 'dev';  ?>" | $(SHORTTAGJS) www/index_tmpl.html > www/index_dev.html
	echo "<? PROJECT_ENV = 'prod'; ?>" | $(SHORTTAGJS) www/index_tmpl.html > www/index_prod.html

index_build_monitor: index_build
	while true; do inotifywait -e modify,create www/index_tmpl.html; make index_build; done
	

#################################################################################
#		jsdoc								#
#################################################################################

jsdoc_build:
	jsdoc -d=doc/jsdoc lib/*.js www/js/*.js

jsdoc_clean:
	rm -rf  doc/jsdoc/*

#################################################################################
#		jsdoc								#
#################################################################################

# TODO switch that to shorttag.js

game_switch_pacmaze:
	ln -sf configProject.pacmaze.js lib/configProject.js 

game_switch_tweetymaze:
	ln -sf configProject.tweetymaze.js lib/configProject.js
	
	
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
#		Apache2								#
#################################################################################


apache2_install: apache2_copy_conf apache2_restart

apache2_restart:
	sudo /etc/init.d/apache2 stop
	sudo killall -9 apache2
	sudo /etc/init.d/apache2 start

apache2_copy_conf:
	(echo '<? var PROJECT_NAME="$(PROJECT_NAME)"; ?>' &&				\
		echo '<? var PROJECT_VERSION="$(PROJECT_VERSION)"; ?>' &&		\
		echo '<? var PROJECT_LATEST_VERSION="$(PROJECT_LATEST_VERSION)"; ?>' )	\
		| $(SHORTTAGJS) etc/apache2/template.siteconf				\
		> /tmp/$(PROJECT_NAME)$(PROJECT_VERSION).conf
	sudo cp -f /tmp/$(PROJECT_NAME)$(PROJECT_VERSION).conf /etc/apache2/sites-enabled/

#################################################################################
#		upstart								#
#################################################################################

upstart_install:
	sudo cp etc/upstart/$(PROCJECT_NAME).upstart	/etc/init/$(PROJECT_NAME).conf

upstart_uninstall:
	sudo rm -f /etc/init/$(PROJECT_NAME).conf

upstart_start:
	sudo initctl start $(PROJECT_NAME)

upstart_stop:
	sudo initctl stop $(PROJECT_NAME)

upstart_status:
	sudo initctl status $(PROJECT_NAME)

upstart_restart:
	sudo initctl restart $(PROJECT_NAME)
	
#################################################################################
#		deploy								#
#################################################################################

deploy:	release_build deployDedixl

deployDedixl:
	#rsync -avz --rsh=ssh build/ /home/jerome/public_html/pacmaze_www_build
	rsync -avz --rsh=ssh build/ dedixl:/home/jerome/public_html/$(PROJECT_NAME)$(PROJECT_VERSION)_www_build
