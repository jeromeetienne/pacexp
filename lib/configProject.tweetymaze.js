/** @namespace */
var WebyMaze	= WebyMaze || {};

/** @namespace */
WebyMaze.ConfigProject	= {};

if( false ){
	WebyMaze.ConfigProject.PROJECT	= 'pacmaze';
	WebyMaze.ConfigProject.ENV	= 'prod';
}else{
	WebyMaze.ConfigProject.PROJECT	= 'tweetymaze';
	WebyMaze.ConfigProject.ENV	= 'dev';
}

//////////////////////////////////////////////////////////////////////////////////
//		commonjs exports						//
//////////////////////////////////////////////////////////////////////////////////

// export commonjs module
if( typeof module !== "undefined" && ('exports' in module)){
	module.exports	= WebyMaze.ConfigProject;
}
