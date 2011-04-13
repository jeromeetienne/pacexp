#!/usr/bin/make
# to automatize repeatitive actions

PROJECT_NAME=pacmaze1

server:
	node lib/server.js

build: release_build jsdoc_build

clean: release_clean jsdoc_clean

install: upstart_install

uninstall: upstart_uninstall

#################################################################################
#		release								#
#################################################################################

release_build: release_clean
	echo "*" > build/.gitignore
	cp www/webglTest.html build
	inliner http://localhost/~jerome/webwork/tweetymaze/www/index.html > build/index.html
	cp -a www/sounds build
	cp -a www/images build
	cp etc/apache2/htaccess build/.htaccess
	mkdir -p build/vendor/soundmanager2/swf
	cp -a www/vendor/soundmanager2/swf/soundmanager2.swf build/vendor/soundmanager2/swf
	mkdir -p build/vendor/socket.io-client/lib/vendor/web-socket-js/
	unzip www/vendor/socket.io-client/lib/vendor/web-socket-js/WebSocketMainInsecure.zip -d build/vendor/socket.io-client/lib/vendor/web-socket-js/
	#echo "CACHE MANIFEST\nCACHE:\n" > build/cache.manifest
	#(cd build && find . -type f | grep -v .bw | grep -v Hot | grep -v .ogg| grep -v .htaccess) | sed 's/ /%20/' >> build/cache.manifest

release_clean:
	rm -rf build/*

#################################################################################
#		jsdoc								#
#################################################################################

jsdoc_build:
	jsdoc -d=doc/jsdoc lib/*.js www/js/*.js

jsdoc_clean:
	rm -rf  doc/jsdoc/*

#################################################################################
#		Apache2								#
#################################################################################

apache2_install_dev: apache2_copy_conf_dev apache2_restart

apache2_install_prod: apache2_copy_conf_prod apache2_restart

apache2_restart:
	sudo /etc/init.d/apache2 stop
	sudo /etc/init.d/apache2 start

apache2_copy_conf_dev:
	sudo ln -fs $(PWD)/etc/apache2/pacmaze_dev_siteconf /etc/apache2/sites-enabled/$(PROJECT_NAME).conf

apache2_copy_conf_prod:
	sudo ln -fs $(PWD)/etc/apache2/pacmaze_prod_siteconf /etc/apache2/sites-enabled/$(PROJECT_NAME).conf

#################################################################################
#		upstart								#
#################################################################################

upstart_install:
	sudo cp etc/upstart/pacmaze.upstart	/etc/init/$(PROJECT_NAME).conf

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
	rsync -avz --rsh=ssh build/ dedixl:/home/jerome/public_html/pacmaze1_www_build
