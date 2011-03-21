#!/usr/bin/make
# to automatize repeatitive actions

PROJECT_NAME=pacmaze

build:
	inliner http://localhost/~jerome/webwork/pacmaze/www/index.html > build/index.html

.PHONY: build

#################################################################################
#		deploy								#
#################################################################################

deploy:	build deployDedixl

deployDedixl:
	rsync -avz --rsh=ssh build/ dedixl:/var/www/pacmaze
