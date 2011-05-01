// global closure
(function(){

var urlBase	= "http://pacmaze.com";
//urlBase		= "http://youtu.be";

//////////////////////////////////////////////////////////////////////////////////
//										//
//////////////////////////////////////////////////////////////////////////////////

var detailTweetLink	= function()
{
	return jQuery(".tweet-text.tweet-text-large a[rel=nofollow][target=_blank]");
}

var detailTweetExist	= function()
{
	return jQuery(".tweet-text.tweet-text-large").length > 0;
}

var detailTweetIframeUrl	= function()
{
	// grab the info from the page
	var observee	= jQuery('.tweet-user-block-screen-name').text();	// @jerome_etienne
	var observer	= jQuery('#screen-name').text().trim();
	if( observer )	observer	= '@'+observer;
	// build iframeUrl
	var iframeUrl	= urlBase;
	var query	= '';
	if( observee )	query	+= (query.length?'&':'') + "embedded_observee="+encodeURIComponent(observee);
	if( observer )	query	+= (query.length?'&':'') + "embedded_observer="+encodeURIComponent(observer);
	if( query )	query	+= (query.length?'&':'') + "embedded_namepspace="+encodeURIComponent('twitter.com');
	if( query )	iframeUrl	+= '?'+query;
	// return  iframeUrl
//console.log("iframeUrl", iframeUrl)
	return iframeUrl;
}

var buildMediaElement	= function()
{
	var iframeUrl	= detailTweetIframeUrl();
	var tweetMediaStr	= ''+
		'<div class="media-instance-container" data-url-id="http://pacmaze.com" data-media-type="Youtube">'+
			'<iframe class="youtube-player" type="text/html" width="446" height="350" src="'+iframeUrl+'" frameborder="0">'+
			'</iframe>'+
			'<div class="media-attribution">'+
				'<span>via</span>'+
				'<img src="//pacmaze.com/favicon.ico">'+
				'<a target="_blank" data-media-type="Youtube" class="media-attribution-link" href="//pacmaze.com">Pacmaze</a>'+
			'</div>'+
		'</div>';
	return jQuery(tweetMediaStr);
}
	
var timeoutCb	= function()
{
	//console.log("a", jQuery(".tweet-text.tweet-text-large a"));

	setTimeout(timeoutCb, 0.5*1000);
	// failed attempts to get prevent key event from going in twitter ui	
	//jQuery("div.media-instance-container iframe").keypress(function(event){
	//	console.log("keypress")
	//	return false;
	//})
	
	if( jQuery('div.media-instance-container').length ){
		console.log("there is a div media instance already. doing nothing")
		return;
	}


	if( jQuery(".tweet-text.tweet-text-large").length === 0 ){
		console.log("no detailed twwet. doing nothing")
		return;
	}
//console.log("detailTweetIframeUrl", detailTweetIframeUrl());
	// scrap includedUrl from the page
	var includedUrl	= null;
	jQuery(".tweet-text.tweet-text-large a[rel=nofollow][target=_blank]").each(function(){
		var href	= jQuery(this).attr('href');
//console.log("href", href)
		// TODO put the urlbase here
		if( href.match(urlBase) === null )	return;
		includedUrl	= href;
	})

	if( !includedUrl )	return;

	
	// build the media element
	var mediaElement	= buildMediaElement();
	// add it to the page
	jQuery('div.tweet-media').empty().append(mediaElement);
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
