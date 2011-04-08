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
WebyMaze.MapUtils.distMapBuild	= function(opts){
	var mayGoto	= opts.mayGoto	|| console.log(false);
	var dstX	= opts.dstX	|| console.log(false);
	var dstY	= opts.dstY	|| console.log(false);
	
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
	flood(dstX, dstY, 0);

	return distMap;
}

/**
 * collision between a sphere and the maze
*/
WebyMaze.MapUtils.distMapShortestDir	= function(distMap, srcX, srcY)
{
	var cardsOffset	= TileMap.cardsOffset;
	var distMax	= distMap.mapW * distMap.mapH;
	var bestDist	= distMap.tile(srcX, srcY);
	var bestDir	= null;

	if( bestDist > distMax )	return null;

	Object.keys(cardsOffset).forEach(function(cardDir){
		var x	= srcX + cardsOffset[cardDir].x;
		var y	= srcY + cardsOffset[cardDir].y;
		if( bestDist <= distMap.tile(x,y) )	return;
		bestDist	= distMap.tile(x,y)+1;
		bestDir		= cardDir;
	})
	
	return bestDir;

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

/**
 * collision between a sphere and the maze
*/
WebyMaze.MapUtils.distMapReachable	= function(distMap, srcX, srcY)
{
	var distMax	= distMap.mapW * distMap.mapH;
	var tileDist	= distMap.tile(srcX, srcY);
	var unreachTile	= WebyMaze.MapUtils.distMapUnreachableTileValue(distMap);
	return tileDist !== unreachTile ? true : false;
}

/**
 * collision between a sphere and the maze
*/
WebyMaze.MapUtils.distMapUnreachableTileValue	= function(distMap)
{
	return distMap.mapW * distMap.mapH + 1;
}

/**
 * collision between a sphere and the maze
*/
WebyMaze.MapUtils.distMapShortestPath	= function(distMap, srcX, srcY)
{
	var directions	= [];
	var curX	= srcX;
	var curY	= srcY;

	while( distMap.tile(curX, curY) != 0 ){
		var bestDir	= WebyMaze.MapUtils.distMapShortestDir(distMap, curX, curY)

		curX	+= TileMap.cardsOffset[bestDir].x;
		curY	+= TileMap.cardsOffset[bestDir].y;

		directions.push(bestDir);
	}

	return directions;		
}

//////////////////////////////////////////////////////////////////////////////////
//		commonjs exports						//
//////////////////////////////////////////////////////////////////////////////////
var main	= function()
{
	var mazeSrv	= new MazeSrv();
	var tileMap	= TileMap.importAscii(mazeSrv.map);

	var srcX	= 5;
	var srcY	= 14;
	var dstX	= 2;
	var dstY	= 1;

	var curX	= srcX;
	var curY	= srcY;



	var distMap	= WebyMaze.MapUtils.distMapBuild({
		mapW	: mazeSrv.mapW(),
		mapH	: mazeSrv.mapH(),
		dstX	: dstX,
		dstY	: dstY,
		mayGoto	: function(x, y){
			//console.log("x", x, "y", y, "isWall", mazeSrv.isWallChar(x, y))
			return mazeSrv.isWallChar(x, y) ? false : true;
		}
	})
	//var bestDir	= WebyMaze.MapUtils.distMapShortestDir(distMap, curX, curY)
	//console.log("bestDir", bestDir)
	//return;
	
	var shortestPath	= WebyMaze.MapUtils.distMapShortestPath(distMap, srcX, srcY);
	console.log("shortestPath", shortestPath)


	while( curX != dstX || curY != dstY ){
		var bestDir	= WebyMaze.MapUtils.distMapShortestDir(distMap, curX, curY)
		var cardsOffset	= TileMap.cardsOffset;

	// display player position
	var dispMap	= TileMap.importAscii(mazeSrv.map);
	dispMap.tile(srcX, srcY, 'S');
	dispMap.tile(dstX, dstY, 'E');
	dispMap.tile(curX, curY, 'C');
	dispMap.consoleDump();

		console.log("bestDir", bestDir)
		curX	+= cardsOffset[bestDir].x;
		curY	+= cardsOffset[bestDir].y;
	}

}
main();
