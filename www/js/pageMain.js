"use strict";
//jQuery(function(){	gamePageMain();	})
jQuery(function(){
	console.log("wow")
	var landingPageBypass	= jQuery.url.param('landingPageBypass') ? true : false;
	if( landingPageBypass ){
		gamePageMain();
	}else{
		var page	= new WebyMaze.LandingPage();
	}
})
