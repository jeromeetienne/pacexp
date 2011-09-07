jQuery(function(){
	jQuery('div.twitter-share-button').live('click', function(event){
		var element	= event.currentTarget;
		// get attributes from element
		var attrs	= {};
		['via', 'url', 'text', 'related'].forEach(function(attrName){
			if( ! jQuery(element).attr('data-'+attrName) )	return;
			attrs[attrName]	= jQuery(element).attr('data-'+attrName);
		})
		// set a default url, if not present
		if( 'url' in attrs === false )	attrs.url	= window.location.href;
		// build queryUrl
		var queryUrl	= '';
		Object.keys(attrs).forEach(function(attrName){
			if( queryUrl.length > 0 )	queryUrl	+= "&";
			queryUrl	+= attrName + "=" + encodeURIComponent(attrs[attrName]);
		})
		// build windowUrl
		var windowUrl	= "http://twitter.com/share";
		if( queryUrl.length > 0 )	windowUrl	+= "?"+queryUrl;
		// determine the position of the window
		var windowW	= 560;
		var windowH	= 500;
		var left	= screen.width / 2 - windowW / 2;
		var top		= screen.height/2  - windowH / 2;
		// open the window
		window.open(windowUrl,'Tweet it','toolbar=1,scrollbars=1,location=1,statusbar=0,menubar=1,resizable=1'+
						',left='+left+',top='+top+',width='+windowW+',height='+windowH);
	});
})
