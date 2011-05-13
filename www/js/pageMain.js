"use strict";
//jQuery(function(){	gamePageMain();	})
jQuery(function(){
	var landingPageBypass	= jQuery.url.param('landingPageBypass') ? true : false;
	if( landingPageBypass ){
		new WebyMaze.PageGame();
	}else{
		new WebyMaze.PageLanding();
	}
})
