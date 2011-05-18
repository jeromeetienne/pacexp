/** @namespace */
var WebyMaze	= WebyMaze || {};

/** @namespace */
WebyMaze.ConfigProject	= {};

WebyMaze.ConfigProject.PROJECT		= 'pacmaze';
WebyMaze.ConfigProject.VERSION		= '4';
WebyMaze.ConfigProject.ENV		= 'prod';
WebyMaze.ConfigProject.LATEST_VERSION	= '4';

//////////////////////////////////////////////////////////////////////////////////
//		commonjs exports						//
//////////////////////////////////////////////////////////////////////////////////

// export commonjs module
if( typeof module !== "undefined" && ('exports' in module)){
	module.exports	= WebyMaze.ConfigProject;
}
