/**
 * what is the purpose of collision ?
 * - is there a collision or not
 * - location of the impacts
 * - position of the collided body after impact
*/

/** @namespace */
var WebyMaze	= WebyMaze || {};


var MazeSrv	= require('./mazeSrv')
var TileMap	= require('./tileMap')
WebyMaze.MapUtils	= require('./mapUtils')

//////////////////////////////////////////////////////////////////////////////////
//		commonjs exports						//
//////////////////////////////////////////////////////////////////////////////////
var main	= function()
{
	var mazeSrv	= new MazeSrv();


	var tileMap	= TileMap.importMazeSrv(mazeSrv);

//tileMap.consoleDump();

	var srcX	= 10;
	var srcY	= 9;
	var dstX	= 20;
	var dstY	= 17;

	var curX	= srcX;
	var curY	= srcY;

	var distMap	= WebyMaze.MapUtils.distMapBuild({
		mapW	: tileMap.mapW,
		mapH	: tileMap.mapH,
		dstX	: dstX,
		dstY	: dstY,
		mayGoto	: function(x, y){
			//console.log("x", x, "y", y, "isWall", mazeSrv.isWallChar(x, y))
			return mazeSrv.isWallChar(x, y) ? false : true;
		}
	})
	distMap.consoleDump();
	//var bestDir	= WebyMaze.MapUtils.distMapShortestDir(distMap, curX, curY)
	//console.log("bestDir", bestDir)
	//return;

	
	var shortestPath	= WebyMaze.MapUtils.distMapShortestPath(distMap, srcX, srcY);
	console.log("shortestPath", shortestPath)
	
	//var firstBestDir	= WebyMaze.MapUtils.distMapMazeSrv2ShortestDir(mazeSrv, srcX, srcY, dstX, dstY);
	//console.log("fisrt bestDir", firstBestDir);
	//console.assert(firstBestDir === shortestPath[0]);
	

	while( curX != dstX || curY != dstY ){
		var bestDir	= WebyMaze.MapUtils.distMapShortestDir(distMap, curX, curY)
		var cardsOffset	= TileMap.cardsOffset;

	console.log("bestDir", bestDir)
	//console.log("curX", curX, "srcY", curY)
	//
	var recpuBestDir	= WebyMaze.MapUtils.distMapMazeSrv2ShortestDir(mazeSrv, curX, curY, dstX, dstY);
	console.log("recpued Dir", recpuBestDir);

	// display player position
	var dispMap	= TileMap.importMazeSrv(mazeSrv);
	dispMap.tile(srcX, srcY, 'S');
	dispMap.tile(dstX, dstY, 'E');
	dispMap.tile(curX, curY, 'C');
	dispMap.consoleDump();

		curX	+= cardsOffset[bestDir].x;
		curY	+= cardsOffset[bestDir].y;
	}
}
main();
