/**
 * what is the purpose of collision ?
 * - is there a collision or not
 * - location of the impacts
 * - position of the collided body after impact
*/

/** @namespace */
var WebyMaze	= WebyMaze || {};


var TileMap	= require('./tileMap.js')

/** bunch of functions
 * @constructs
*/
WebyMaze.MapUtils	= function(){}


/**
 * collision between a sphere and the maze
*/
WebyMaze.MapUtils.shortestPath	= function(opts){
	var mayGoto	= opts.mayGoto	|| console.log(false);
	var startX	= opts.startX	|| console.log(false);
	var startY	= opts.startY	|| console.log(false);
	var endX	= opts.endX	|| console.log(false);
	var endY	= opts.endY	|| console.log(false);
	
	var mapW	= opts.mapW	|| console.log(false);
	var mapH	= opts.mapH	|| console.log(false);

	var offsets	= [{x:+1, y:0}, {x: 0, y: -1}, {x:-1, y:0}, {x:0, y:+1}]
	
	// compute the maximal distance between 2 points in the map
	var distMax	= mapW*mapH;
	
	// build the initial distMap with all distance == distMax + 1 
	var distMap	= [];
	for(var mapX = 0; mapX < mapW; mapX++ ){
		distMap[mapX]	= new Array(mapH);
		for(var mapY = 0; mapY < mapH; mapY++ ){
			distMap[mapX][mapY]	= distMax + 1;
		}		
	}

// TODO make a tilemap class
// - a 2 dim array with values in it
// - value may be int, or string
// - able to set/get tile value
// - use it to store the distMap
// - use it to store the maze

	/** Flood the heightMap	*/
	var flood	= function(x, y, dist){
		// if this point is already closer, do nothing
		if( distMap[x][y] <= dist )	return;
		// set the new Distance
		distMap[x][y]	= dist;
		// flood all advacents tiles if it mayGoto() it.
		offsets.forEach(function(offset){
			if( mayGoto(x+ offset.x, y + offset.x) === false )	return;
			flood(x + offset.x, y + offset.y, dist+1)
		});
	}
	// initiate the reccusion
	flood(startX, startY, 0);
	
	// TODO now that the distMap is built roll back from endX, endY to startX, startY
	// - if endX, endY still got >= distMax, then endX, endY is unreachable
	// - else follow the smallest distance up to 0
	

	if( distMap[endX][endY] > distMax )	return null;
	var bestDist	= distMax+1;
	var bestDir	= null;
	if( bestDir > distMap[endX+1][endY+0] ){
		bestDir	= distMap[endX+1][endY+0];
		bestDir	= "east";
	}
	if( bestDir > distMap[endX+0][endY-1] ){
		bestDir	= distMap[endX+0][endY-1];
		bestDir	= "north";
	}
	if( bestDir > distMap[endX+0][endY+1] ){
		bestDir	= distMap[endX+0][endY+1];
		bestDir	= "south";
	}
	if( bestDir > distMap[endX-1][endY+0] ){
		bestDir	= distMap[endX-1][endY+0];
		bestDir	= "west";
	}
	return bestDir;		
}



//////////////////////////////////////////////////////////////////////////////////
//		commonjs exports						//
//////////////////////////////////////////////////////////////////////////////////

// export in common js
if( typeof module !== "undefined" && ('exports' in module)){
	module.exports	= WebyMaze.MapUtils;
}
