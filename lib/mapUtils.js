/**
 * what is the purpose of collision ?
 * - is there a collision or not
 * - location of the impacts
 * - position of the collided body after impact
*/

/** @namespace */
var WebyMaze	= WebyMaze || {};

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
		var offsets	= [[x+1, y], [x, y-1], [x-1, y], [x, y+1]]
		offsets.forEach(function(offset){
			var offX	= offset[0];
			var offY	= offset[1];
			if( mayGoto(x+1, y) === false )	return;
			flood(x + offX, x + offY, dist+1)
		});
	}
	// initiate the reccusion
	flood(startX, startY, 0);
	
	// TODO now that the distMap is built roll back from endX, endY to startX, startY
	// - if endX, endY still got >= distMax, then endX, endY is unreachable
	// - else follow the smallest distance up to 0
}



//////////////////////////////////////////////////////////////////////////////////
//		commonjs exports						//
//////////////////////////////////////////////////////////////////////////////////

// export in common js
if( typeof module !== "undefined" && ('exports' in module)){
	module.exports	= WebyMaze.MapUtils;
}
