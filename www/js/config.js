/** @namespace */
var WebyMaze	= WebyMaze || {};

/**
 * To handle the config
 * 
 * @constructor
*/
WebyMaze.Config	= function(){
}
WebyMaze.Config.prototype.destroy	= function(){
}


//////////////////////////////////////////////////////////////////////////////////
//		ctor/dtor							//
//////////////////////////////////////////////////////////////////////////////////

/**
 * getter/setter for username (stored in cookie)
 * @returns {string} the value if val is undefined
*/
WebyMaze.Config.prototype.username	= function(val)
{
	return this._cookieGetSet('username', val);
}

/**
 * getter/setter for sound (stored in cookie)
 * @returns {string} the value if val is undefined
*/
WebyMaze.Config.prototype.soundTrack	= function(val)
{
	return this._cookieGetSet('soundTrack', val);
}

/**
 * getter/setter for sound (stored in cookie)
 * @returns {string} the value if val is undefined
*/
WebyMaze.Config.prototype.soundFx		= function(val)
{
	return this._cookieGetSet('soundFx', val);
}

WebyMaze.Config.prototype._cookieGetSet	= function(key, val)
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
WebyMaze.Config.prototype.gameId	= function(val){
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


