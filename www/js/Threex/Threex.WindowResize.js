if(typeof THREEx === "undefined")	var THREEx	= {};

fontSizeAdjust	= function(){
	var fontRatio	= 1;
	var windowW	= 1680;
	var ratioW	= window.innerWidth/windowW;
	var fixRatio	= function(ratioW){ return 3*(1-ratioW) + 1; };
	var fontSize	= 100 * fontRatio * ratioW * fixRatio(ratioW);
	fontSize	= Math.round(fontSize*100) / 100
	jQuery("body").css('font-size', fontSize+'%');	
}

jQuery(function(){ fontSizeAdjust() });

/**
 * Adjust the display when the window is resized
*/
THREEx.WindowResize	= function(renderer, camera){
	var callback	= function(){
		
		fontSizeAdjust();
		
		renderer.setSize( window.innerWidth, window.innerHeight );
		camera.aspect	= window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix()
	}
	window.addEventListener('resize', callback, false);
	return {
		unbind	: function(){
			window.removeEventListener('resize', callback);
		}
	}
}
