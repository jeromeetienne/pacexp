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
var MapUtils2	= require('./mapUtils2.js')


//////////////////////////////////////////////////////////////////////////////////
//		commonjs exports						//
//////////////////////////////////////////////////////////////////////////////////
var main	= function()
{
	var mazeSrv	= new MazeSrv();

	var tileMap	= TileMap.importMazeSrv(mazeSrv);
	//tileMap.consoleDump();
	
	var scaterPlaces	= {
		'blinky': { x: -4, y:  2},
		'pinky'	: { x: -4, y: 16},
		'clyde'	: { x: 22, y: 18},
		'inky'	: { x: 22, y:  0}
	};	
	var zombiePlace	= {
		x	: 8,
		y	: 9
	};
	
	var enemyType	= 'blinky';
	var enemyType	= 'clyde';

	var srcX	= 20;
	var srcY	= 17;
	var dstX	= zombiePlace.x;
	var dstY	= zombiePlace.y;
	var curDir	= null;
	//var curDir	= 'east'

	var curX	= srcX;
	var curY	= srcY;

	while( curX != dstX || curY != dstY ){
		var bestDir	= MapUtils2.bestDirPacman(tileMap, curDir, curX, curY, dstX, dstY);
		//var bestDir	= bestDirPacman(tileMap, fromDir, tileX, tileY, targetX, targetY)

		console.log("bestDir", bestDir, "curX", curX, "curY", curY)
		// display player position
		var dispMap	= TileMap.importMazeSrv(mazeSrv);
		if( dispMap.withinMap(srcX, srcY) )	dispMap.tile(srcX, srcY, 'S');
		if( dispMap.withinMap(curX, curY) )	dispMap.tile(curX, curY, 'C');
		if( dispMap.withinMap(dstX, dstY) )	dispMap.tile(dstX, dstY, 'D');
		dispMap.consoleDump();

		curDir	= bestDir;
		if( bestDir ){			
			curX	+= TileMap.cardsOffset[bestDir].x;
			curY	+= TileMap.cardsOffset[bestDir].y;
		}

	}
}
main();
