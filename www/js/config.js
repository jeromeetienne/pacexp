var WebyMaze	= WebyMaze || {};

/**
 * To handle the config
*/
WebyMaze.Config	= function(opts){
}
WebyMaze.Config.prototype.destroy	= function(){
}


//////////////////////////////////////////////////////////////////////////////////
//		ctor/dtor							//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.Config.prototype.username	= function(val)
{
	return val ? jQuery.cookie('username', val) : jQuery.cookie('username');
}

WebyMaze.Config.prototype.sound		= function(val)
{
	return val ? jQuery.cookie('sound', val) : jQuery.cookie('sound');
}

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


