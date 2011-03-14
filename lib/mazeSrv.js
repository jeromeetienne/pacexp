var WebyMaze	= WebyMaze || {};

WebyMaze.MazeSrv	= function(){
	this.map	= [
		"**.*************",
		"*...*..*...*.*.*",
		"*...*..*.....*.*",
		"*...*.....**.*.*",
		"*...*..*...*...*",
		"*..............*",
		"*..............*",
		"*****.***.******",
	];
}

WebyMaze.MazeSrv.prototype.getMap	= function(){
	return this.map;
}


// export commonjs module
if( module && module.exports ){
	module.exports	= WebyMaze.MazeSrv;
}
