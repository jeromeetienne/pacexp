/** @namespace */
var WebyMaze	= WebyMaze || {};

WebyMaze.MazeSrv	= function(){
	this.cubeW	= 100;

	this.map	= [
		"*****************",
		"*.......*...*.*.*",
		"*.......*.....*.*",
		"*..........**.*.*",
		"*...*.......*...*",
		"*...*.......*...*",
		"*...............*",
		"*...............*",
		"*****************",
	];
	this.mapPacmaze	= [
		"***************************************************************",
		"*.............................................................*",
		"*.............................................................*",
		"*.............................................................*",
		"*..*...*......*.....***.*.....................................*",
		"*..*.*.*..**..***..*....*.....................................*",
		"*..*.*.*.*.**.*..*.*.**.*.....................................*",
		"*..*.*.*.**...*..*.*..*.*.....................................*",
		"*...*.*...**..***...***.****..................................*",
		"*.............................................................*",
		"*...............*.........*...................................*",
		"*..*.*..**...**.*..*..***.*...................................*",
		"*..**..*..*.*...*.*..**...*...................................*",
		"*..*...*..*.*...***....**.....................................*",
		"*..*....**...**.*..*.***..*.wr................................*",
		"*.............................................................*",
		"*.............................................................*",
		"***************************************************************",
	];
	
	this.mapPacman1	= [
		"*******************",
		"*........*........*",
		"*.**.***.*.***.**.*",
		"*.**.***.*.***.**.*",
		"*.................*",
		"*.**.*.*****.*.**.*",
		"*....*...*...*....*",
		"****.***.*.***.****",
		"****.*.......*.****",
		"****.*.**.**.*.****",
		".......*...*.......",
		"****.*.*****.*.****",
		"****.*..w.r..*.****",
		"****.*.*****.*.****",
		"*........*........*",
		"*.**.***.*.***.**.*",
		"*..*...........*..*",
		"**.*.*.*****.*.*.**",
		"*....*...*...*....*",
		"*.******.*.******.*",
		"*.................*",
		"*******************",
	];

	this.map	= this.mapPacmaze;

	// rotate the map to make it appears the same in webgl
	var tmp	= [];
	for(var i = 0; i < this.map[0].length; i++ ){
		tmp[i]	= "";
		for(var j = 0; j < this.map.length; j++ ){
			tmp[i]	+= this.map[j][this.map[0].length-1-i];
		}		
	}
	this.map	= tmp;
	
	//this._fillPills();
}

WebyMaze.MazeSrv.PillChars	= ['w', 'r'];
WebyMaze.MazeSrv.WallChars	= ['*'];
WebyMaze.MazeSrv.GroundChars	= ['.'];

WebyMaze.MazeSrv.isWallChar	= function(mazeChar){
	return WebyMaze.MazeSrv.WallChars.indexOf(mazeChar) != -1
}
WebyMaze.MazeSrv.isGroundChar	= function(mazeChar){
	return WebyMaze.MazeSrv.GroundChars.indexOf(mazeChar) != -1
}
WebyMaze.MazeSrv.isPillChar	= function(mazeChar){
	return WebyMaze.MazeSrv.PillChars.indexOf(mazeChar) != -1
}
WebyMaze.MazeSrv.PillType	= function(mazeChar){
	if( mazeChar === 'w' )		return 'white';
	else if( mazeChar === 'r' )	return 'red';
	console.assert(false, "unknown mazeChare "+mazeChar)
	return undefined;
}


WebyMaze.MazeSrv.prototype.getMap	= function(){
	return this.map;
}

/**
 * Replace all GroundChar by pills (temp just to debug)
*/
WebyMaze.MazeSrv.prototype._fillPills	= function()
{
	var map		= this.map;
	var cubeW	= this.cubeW;
	var mazeH	= map.length;
	var mazeW	= map[0].length;	
	for(var y = 0; y < mazeH; y++){
		var mazeLine	= map[y];
		var tmpLine	= ''
		for(var x = 0; x < mazeW; x++){
			var mazeXY	= mazeLine.charAt(x);
			if( WebyMaze.MazeSrv.isGroundChar(mazeXY) ){				
				tmpLine	+= "w";
			}else{
				tmpLine	+= mazeXY;
			}
		}
		map[y]	= tmpLine;
		// TODO remove it... without it it trigger a bug i dont understand
		if( y > 4 ) break;
	}
}



// export commonjs module
if( module && module.exports ){
	module.exports	= WebyMaze.MazeSrv;
}
