var WebyMaze	= WebyMaze || {};

/**
 *
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
}

WebyMaze.Config.prototype.sound		= function(val)
{
}

WebyMaze.Config.prototype.gameId	= function(val){
	var set	= function(val){
		window.location.hash	= '#'+val;
	}
	var get = function(){
		var hash	= window.location.hash
		if( !hash )	return null;
		return hash.substr(1);		
	}
	return val ? set(val) : get();
}


