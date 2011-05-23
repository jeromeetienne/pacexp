/** @namespace */
var WebyMaze	= WebyMaze || {};

module.exports = {};

/** @namespace */
WebyMaze.ConfigSrv	= {};

WebyMaze.ConfigSrv.mazeSrv	= {
	mapType		: 'pacman2',
	mapLightingDfl	: 'day',
};

//////////////////////////////////////////////////////////////////////////////////
//		commonjs exports						//
//////////////////////////////////////////////////////////////////////////////////

// export commonjs module
if( module && module.exports ){
	module.exports	= WebyMaze.ConfigSrv;
}

