/** @namespace */
var WebyMaze	= WebyMaze || {};

/** @namespace */
WebyMaze.ConfigProject	= {};

WebyMaze.ConfigProject.PROJECT	= 'tweetymaze';
WebyMaze.ConfigProject.ENV	= 'dev';

//////////////////////////////////////////////////////////////////////////////////
//		commonjs exports						//
//////////////////////////////////////////////////////////////////////////////////

// export commonjs module
if( typeof module !== "undefined" && ('exports' in module)){
	module.exports	= WebyMaze.ConfigProject;
}
