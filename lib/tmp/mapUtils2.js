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
WebyMaze.MapUtils2	= {}


/**
 * collision between a sphere and the maze
*/
WebyMaze.MapUtils2.bestDirPacman	= function(tileMap, curDir, srcX, srcY, dstX, dstY)
{
	var cardsOffset	= TileMap.cardsOffset;
	var bestDir	= null;
	var bestDistance= Number.MAX_VALUE;
	
	Object.keys(cardsOffset).forEach(function(direction){
		var offX	= cardsOffset[direction].x;
		var offY	= cardsOffset[direction].y;
		var tmpX	= srcX + offX;
		var tmpY	= srcY + offY;
		// never authorized to go back
		if( direction == TileMap.cardsOpposite[curDir])	return;
		// if this tile is not within Map, ignore it
		if( tileMap.withinMap(tmpX, tmpY) === false )	return;
		// get tileValue
		var tileValue	= tileMap.tile(tmpX, tmpY);
		// if this is a wall, ignore it
		if( MazeSrv.isWallChar(tileValue) )	return;
		// compute distance with dstX dstY
		var deltaX	= dstX - tmpX;
		var deltaY	= dstY - tmpY;
		var distance	= Math.sqrt(deltaX*deltaX + deltaY*deltaY);
//console.log("dir", direction, "titleValue", tileValue, "tmpX", tmpX, "tmpY", tmpY, "distance", distance)
		// update bestDistance if needed
		if( distance < bestDistance ){
			bestDir		= direction;
			bestDistance	= distance;
		}
	})
	//console.log("bestDir", bestDir, "bestDistance", bestDistance)
	// return the bestDir
	return bestDir;
}

WebyMaze.MapUtils2.mazeSrv2PacmanDir	= function(mazeSrv, curDir, srcX, srcY, dstX, dstY)
{
	var tileMap	= TileMap.importMazeSrv(mazeSrv);
	return WebyMaze.MapUtils2.bestDirPacman(tileMap, curDir, srcX, srcY, dstX, dstY);;
}

//////////////////////////////////////////////////////////////////////////////////
//		commonjs exports						//
//////////////////////////////////////////////////////////////////////////////////

// export in common js
if( typeof module !== "undefined" && ('exports' in module)){
	module.exports	= WebyMaze.MapUtils2;
}

