/** @namespace */
var WebyMaze	= WebyMaze || {};

module.exports = {};

/** @namespace */
WebyMaze.ConfigSrv	= {};

WebyMaze.ConfigSrv.mazeSrv	= {
	mapType		: 'pacman1',
	mapLightingDfl	: 'firecamp',
};

//////////////////////////////////////////////////////////////////////////////////
//		commonjs exports						//
//////////////////////////////////////////////////////////////////////////////////

// export commonjs module
if( module && module.exports ){
	module.exports	= WebyMaze.ConfigSrv;
}

