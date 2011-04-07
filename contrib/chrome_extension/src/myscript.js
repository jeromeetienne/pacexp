(function(){

var urlBase	= "http://pacmaze.com";
urlBase	= "http://mobiledesign.org";

//////////////////////////////////////////////////////////////////////////////////
//										//
//////////////////////////////////////////////////////////////////////////////////

detailTweetUrl	= function()
{
	return jQuery(".tweet-text.tweet-text-large a[href^='"+urlBase+"']").attr('href');
}


// TODO is there better than this timer ? like a event on dom change ?
setInterval(function(){
	var href	= detailTweetText();
	if( !href )	return;
	console.log("href=", href)
}, 0.5*1000)

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
