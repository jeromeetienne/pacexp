# just a little makefile to store repreatitive task


clean: pacmaze_clean buddymaze_clean

build: clean pacmaze_build buddymaze_build

#################################################################################
#		pacmaze								#
#################################################################################

pacmaze_build:
	zip -r pacmaze.zip pacmaze_src
	
pacmaze_build_crx:
	google-chrome --pack-extension=pacmaze_src --pack-extension-key=chrome_extension_key.pem
	
pacmaze_clean:
	rm -rf pacmaze.zip pacmaze_src.crx

#################################################################################
#		buddymaze							#
#################################################################################

buddymaze_build:
	zip -r buddymaze.zip buddymaze_src
	
buddymaze_build_crx:
	google-chrome --pack-extension=buddymaze_src --pack-extension-key=chrome_extension_key.pem

buddymaze_clean:
	rm -rf buddymaze.zip buddymaze_src.crx
