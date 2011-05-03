/** @namespace */
var WebyMaze	= WebyMaze || {};

/**
 * To handle the config
 * - TODO to rename ConfigStore
 * 
 * @constructor
*/
WebyMaze.ConfigStore	= function(){
}
WebyMaze.ConfigStore.prototype.destroy	= function(){
}


//////////////////////////////////////////////////////////////////////////////////
//		ctor/dtor							//
//////////////////////////////////////////////////////////////////////////////////

/**
 * getter/setter for username (stored in cookie)
 * @returns {string} the value if val is undefined
*/
WebyMaze.ConfigStore.prototype.username	= function(val)
{
	var key	= 'username';
	if( typeof val === 'undefined' && jQuery.url.param(key) )	return jQuery.url.param(key);
	return this._cookieGetSet(key, val);
}

/**
 * getter/setter for sound (stored in cookie)
 * @returns {string} the value if val is undefined
*/
WebyMaze.ConfigStore.prototype.soundTrack	= function(val)
{
	var key	= 'soundTrack';
	if( typeof val === 'undefined' && jQuery.url.param(key) )	return jQuery.url.param(key);
	return this._cookieGetSet(key, val);
}

/**
 * getter/setter for sound (stored in cookie)
 * @returns {string} the value if val is undefined
*/
WebyMaze.ConfigStore.prototype.soundFx		= function(val)
{
	var key	= 'soundFx';
	if( typeof val === 'undefined' && jQuery.url.param(key) )	return jQuery.url.param(key);
	return this._cookieGetSet(key, val);
}

WebyMaze.ConfigStore.prototype._cookieGetSet	= function(key, val)
{
	if( typeof val === 'undefined' )	return jQuery.cookie(key);
	// compute the expiration date
	var expires	= new Date();
	expires.setTime(expires.getTime()+(30  *24*60*60*1000));
	// actually set the cookie
	jQuery.cookie(key, val, { expires: expires })
}


/**
 * getter/setter for sound (stored in location.hash for bookmarkability)
 * @returns {string} the value if val is undefined
*/
WebyMaze.ConfigStore.prototype.gameId	= function(val){
	var set	= function(val){
		console.assert(typeof val === "string")
		window.location.hash	= '#'+val;
	}
	var get = function(){
		var hash	= window.location.hash
		if( !hash )	return null;
		return hash.substr(1);		
	}
	return val ? set(val) : get();
}


