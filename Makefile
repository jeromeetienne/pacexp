#!/usr/bin/make
# to automatize repeatitive actions

PROJECT_NAME=pacmaze
APACHE2_CONFFILE=/etc/apache2/sites-enabled/pacmazecom.conf

server:
	node lib/server.js

build:
	inliner http://localhost/~jerome/webwork/tweetymaze/www/index.html > build/index.html
	cp -a www/sounds build
	cp -a www/images build
	mkdir -p build/vendor/soundmanager2/swf
	cp -a www/vendor/soundmanager2/swf/soundmanager2.swf build/vendor/soundmanager2/swf

.PHONY: build

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

apache2_install_prod: apache2_copy_conf_prod apache2_restart

apache2_install_dev: apache2_copy_conf_dev apache2_restart

apache2_restart:
	sudo /etc/init.d/apache2 stop
	sudo /etc/init.d/apache2 start

apache2_copy_conf_dev:
	sudo ln -fs $(PWD)/etc/pacmazecom_dev_siteconf $(APACHE2_CONFFILE)

apache2_copy_conf_prod:
	sudo ln -fs $(PWD)/etc/pacmazecom_prod_siteconf $(APACHE2_CONFFILE)

#################################################################################
#		deploy								#
#################################################################################

deploy:	build deployDedixl

deployDedixl:
	#rsync -avz --rsh=ssh build/ /home/jerome/public_html/pacmaze_www_build
	rsync -avz --rsh=ssh build/ dedixl:/home/jerome/public_html/pacmaze_www_build
