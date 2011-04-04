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
	return val ? jQuery.cookie('username', val) : jQuery.cookie('username');
}

/**
 * getter/setter for sound (stored in cookie)
 * @returns {string} the value if val is undefined
*/
WebyMaze.Config.prototype.sound		= function(val)
{
	return val ? jQuery.cookie('sound', val) : jQuery.cookie('sound');
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


