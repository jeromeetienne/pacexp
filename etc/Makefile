
DSTFILE=/etc/apache2/sites-enabled/pacmazecom.conf

install: install_prod

install_prod: apache2_copy_conf_prod restart

install_dev: apache2_copy_conf_dev restart

restart:
	sudo /etc/init.d/apache2 restart

apache2_copy_conf_dev:
	sudo ln -fs $(PWD)/pacmazecom_dev_siteconf $(DSTFILE)

apache2_copy_conf_prod:
	sudo ln -fs $(PWD)/pacmazecom_prod_siteconf $(DSTFILE)
