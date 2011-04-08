/**
 * what is the purpose of collision ?
 * - is there a collision or not
 * - location of the impacts
 * - position of the collided body after impact
*/

/** @namespace */
var WebyMaze	= WebyMaze || {};


var MazeSrv	= require('../mazeSrv.js')
var TileMap	= require('./tileMap.js')

/** bunch of functions
 * @constructs
*/
WebyMaze.MapUtils	= function(){}


/**
 * collision between a sphere and the maze
*/
WebyMaze.MapUtils.buildDistMap	= function(opts){
	var mayGoto	= opts.mayGoto	|| console.log(false);
	var startX	= opts.startX	|| console.log(false);
	var startY	= opts.startY	|| console.log(false);
	var endX	= opts.endX	|| console.log(false);
	var endY	= opts.endY	|| console.log(false);
	
	var mapW	= opts.mapW	|| console.log(false);
	var mapH	= opts.mapH	|| console.log(false);

console.log("opts", opts)
	var cardsOffset	= TileMap.cardsOffset;
	
	// compute the maximal distance between 2 points in the map
	var distMax	= mapW*mapH;
	
	// build the initial distMap with all distance == distMax + 1 
	var distMap	= new TileMap({
		mapW	: mapW,
		mapH	: mapH,
		dflTile	: distMax
	});

// TODO make a tilemap class
// - a 2 dim array with values in it
// - value may be int, or string
// - able to set/get tile value
// - use it to store the distMap
// - use it to store the maze

	/** Flood the heightMap	*/
	var flood	= function(x, y, dist){
		// if this point is already closer, do nothing
		//console.log("flood x", x, "y", y, "dist", distMap.tile(x, y));
		if( distMap.tile(x, y) <= dist )	return;
		// set the new Distance
		distMap.tile(x, y, dist);
		// flood all advacents tiles if it mayGoto() it.
		Object.keys(cardsOffset).forEach(function(cardDir){
			var nx	= x + cardsOffset[cardDir].x;
			var ny	= y + cardsOffset[cardDir].y;
			if( mayGoto( nx, ny ) === false )	return;
			flood( nx, ny, dist+1)
		});
	}
	// initiate the reccusion
	flood(endX, endY, 0);

	
	// TODO now that the distMap is built roll back from endX, endY to startX, startY
	// - if endX, endY still got >= distMax, then endX, endY is unreachable
	// - else follow the smallest distance up to 0
	
	var bestDir	= WebyMaze.MapUtils.shortestPathDir(distMap, startX, startY)
	
	return bestDir;		
}

/**
 * collision between a sphere and the maze
*/
WebyMaze.MapUtils.shortestPathDir	= function(distMap, startX, startY)
{
	var cardsOffset	= TileMap.cardsOffset;
	var distMax	= distMap.mapW * distMap.mapH;
	var bestDist	= distMap.tile(startX, startY);
	var bestDir	= null;

	if( bestDist > distMax )	return null;

	Object.keys(cardsOffset).forEach(function(cardDir){
		var x	= startX + cardsOffset[cardDir].x;
		var y	= startY + cardsOffset[cardDir].y;
		if( bestDist <= distMap.tile(x,y) )	return;
		bestDist	= distMap.tile(x,y)+1;
		bestDir		= cardDir;
	})

distMap.forEach(function(x, y, tileValue){
	if( tileValue === distMax )	distMap.tile(x,y, '*')
})
distMap.consoleDump();
//return "blabla";
//return;

console.log("bestDist", bestDist)
console.log("bestDir", bestDir)
//console.assert(false);

	return bestDir;		
}

//////////////////////////////////////////////////////////////////////////////////
//		commonjs exports						//
//////////////////////////////////////////////////////////////////////////////////
var main	= function()
{
	var mazeSrv	= new MazeSrv();
	var tileMap	= TileMap.importAscii(mazeSrv.map);

	var startX	= 5;
	var startY	= 14;
	var endX	= 6;
	var endY	= 6;

	var curX	= startX;
	var curY	= startY;


	// display player position
	var dispMap	= TileMap.importAscii(mazeSrv.map);
	dispMap.tile(startX, startY, 'S');
	dispMap.tile(endX, endY, 'E');
	dispMap.consoleDump();

	while(true){
		
		var cardinalDir	= WebyMaze.MapUtils.buildDistMap({
			mapW	: mazeSrv.mapW(),
			mapH	: mazeSrv.mapH(),
			startX	: curX,
			startY	: curY,
			endX	: endX,
			endY	: endY,
			mayGoto	: function(x, y){
				//console.log("x", x, "y", y, "isWall", mazeSrv.isWallChar(x, y))
				return mazeSrv.isWallChar(x, y) ? false : true;
			}
		})
		console.log("cardinalDir", cardinalDir)
	return;
	}

}
main();
