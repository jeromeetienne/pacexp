/** @namespace */
var WebyMaze	= WebyMaze || {};

/** @namespace */
WebyMaze.ConfigProject	= {};

WebyMaze.ConfigProject.PROJECT		= 'tweetymaze';
WebyMaze.ConfigProject.VERSION		= '2';
WebyMaze.ConfigProject.ENV		= 'dev';
WebyMaze.ConfigProject.LATEST_VERSION	= '2';

//////////////////////////////////////////////////////////////////////////////////
//		commonjs exports						//
//////////////////////////////////////////////////////////////////////////////////

// export commonjs module
if( typeof module !== "undefined" && ('exports' in module)){
	module.exports	= WebyMaze.ConfigProject;
}
