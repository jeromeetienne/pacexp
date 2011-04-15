(function(){

var urlBase	= "http://pacmaze.com";
//urlBase		= "http://youtu.be";

//////////////////////////////////////////////////////////////////////////////////
//										//
//////////////////////////////////////////////////////////////////////////////////

detailTweetUrl	= function()
{
	return jQuery(".tweet-text.tweet-text-large a").attr('href');
}

detailTweetExist	= function()
{
	return jQuery(".tweet-text.tweet-text-large").length > 0;
}

var tweetMediaStr	= ''+
	'<div class="media-instance-container" data-url-id="http://pacmaze.com" data-media-type="Youtube">'+
		'<iframe class="youtube-player" type="text/html" width="446" height="350" src="http://pacmaze.com" frameborder="0">'+
		'</iframe>'+
		'<div class="media-attribution">'+
			'<span>via</span>'+
			'<img src="//pacmaze.com/favicon.ico">'+
			'<a target="_blank" data-media-type="Youtube" class="media-attribution-link" href="//pacmaze.com">Pacmaze</a>'+
		'</div>'+
	'</div>';
	
var timeoutCb	= function()
{
	//console.log("a", jQuery(".tweet-text.tweet-text-large a"));
	
	if( jQuery('div.media-instance-container').length ){
		console.log("there is a div media instance already. doing nothing")
		return;
	}


	setTimeout(timeoutCb, 0.5*1000);

	if( !detailTweetExist() ){
		console.log("no detailed twwet. doing nothing")
		return;
	}

	var href	= detailTweetUrl();
	var media	= jQuery(tweetMediaStr)
	
	jQuery('div.tweet-media').empty().append(media);
	
	return;
	
	var href	= detailTweetUrl();
	console.log("losta")
	if( !href )	return;
	console.log("href=", href)	
}

// TODO is there better than this timer ? like a event on dom change ?
setTimeout(timeoutCb, 0.5*1000)

// test if the pane exist
// if yes, test if it contains http://pacmaze.com
// if yes, open an iframe below
// - match twitter struct as much as possible
//   - how to do that ?
//   - i capture it on a similar view.
//   - dump it as string...
//   - adapt it with jQuery + regexp
//   - store that in the file
//   - insert it in the dom
// - 2 phases
//   - collect struct during dev
//   - matching + recontructing during use

})();
