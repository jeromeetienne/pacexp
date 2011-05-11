"use strict";
//jQuery(function(){	gamePageMain();	})
jQuery(function(){
	var landingPageBypass	= jQuery.url.param('landingPageBypass') ? true : false;
	if( landingPageBypass ){
		pageGameMain();
	}else{
		var page	= new WebyMaze.PageLanding();
	}
})
