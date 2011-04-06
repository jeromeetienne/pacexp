/** @namespace */
var WebyMaze	= WebyMaze || {};

/**
 * Handle the map.
 *
 * TODO rename this mapSrv. same for client
*/
WebyMaze.MazeSrv	= function(){
	this.tileW	= 100;

	this.cubeW	= this.tileW;	// TODO rename this tileW

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
		"******************************.********************************",
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
		"******************************.********************************",
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
		"*......*...*......*",
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

	//this.map	= this.mapPacmaze;
	this.map	= this.mapPacman1;

	// rotate the map to make it appears the same in webgl
	this._rotateMap();
	
	// put pills everywhere
	//this._fillPills();
}

/**
 * rotate the map to make it appears the same in ascii and in webgl
*/
WebyMaze.MazeSrv.prototype._rotateMap	= function(){
	var tmp	= [];
	for(var i = 0; i < this.mapW(); i++ ){
		tmp[i]	= "";
		for(var j = 0; j < this.mapH(); j++ ){
			tmp[i]	+= this.map[j][this.map[0].length-1-i];
		}		
	}
	this.map	= tmp;
}


/**
 * Replace all GroundChar by pills (temp just to debug)
*/
WebyMaze.MazeSrv.prototype._fillPills	= function()
{
	var mazeW	= this.mapW();	
	var mazeH	= this.mapH();
	for(var y = 0; y < mazeH; y++){
		var mazeLine	= this.map[y];
		var tmpLine	= ''
		for(var x = 0; x < mazeW; x++){
			var mazeXY	= mazeLine.charAt(x);
			if( WebyMaze.MazeSrv.isGroundChar(mazeXY) && x%2 == 0){
				tmpLine	+= "w";
			}else{
				tmpLine	+= mazeXY;
			}
		}
		if(y % 2 == 0)	this.map[y]	= tmpLine;
		else		this.map[y]	= this.map[y];
	}
}

//////////////////////////////////////////////////////////////////////////////////
//		misc								//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.MazeSrv.prototype.getMap	= function(){
	return this.map;
}

WebyMaze.MazeSrv.prototype.mapChar	= function(x, y)
{
	return this.map[y][x];
}


WebyMaze.MazeSrv.prototype.mapW	= function()
{
	return this.map[0].length	
}

WebyMaze.MazeSrv.prototype.mapH	= function()
{
	return this.map.length	
}

WebyMaze.MazeSrv.prototype.map2spaceX	= function(mazeX)
{
	return ( mazeX - Math.floor(this.mapW()/2) ) * this.tileW;
}

WebyMaze.MazeSrv.prototype.map2spaceY	= function(mazeY)
{
	return ( mazeY - Math.floor(this.mapH()/2) ) * this.tileW;
}



//////////////////////////////////////////////////////////////////////////////////
//		mapchar								//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.MazeSrv.prototype.forEach	= function(callback)
{
	for( var x = 0; x < this.mapW(); x++ ){
		for( var y = 0; y < this.mapH(); y++ ){
			var stopnow	= callback(x, y);
			if( stopnow)	return;
		}
	}
}

WebyMaze.MazeSrv.prototype.forEachType	= function(charFilter, callback)
{
	this.forEach(function(x, y){
		var mapChar	= this.mapChar(x, y);
		if( charFilter(mapChar) !== true )	return undefined;
		return callback(x, y);
	}.bind(this))
}

WebyMaze.MazeSrv.prototype.forEachWall	= function(callback)
{
	return this.forEachType(WebyMaze.MazeSrv.isWallChar, callback);
}
WebyMaze.MazeSrv.prototype.forEachGround	= function(callback)
{
	return this.forEachType(WebyMaze.MazeSrv.isGroundChar, callback);
}

WebyMaze.MazeSrv.prototype.forEachPill	= function(callback)
{
	return this.forEachType(WebyMaze.MazeSrv.isPillChar, callback);
}


WebyMaze.MazeSrv.prototype.isWallChar	= function(x, y){
	var mapChar	= this.mapChar(x,y);
	return WebyMaze.MazeSrv.isWallChar(mapChar);
}

WebyMaze.MazeSrv.prototype.isGroundChar	= function(x, y){
	var mapChar	= this.mapChar(x,y);
	return WebyMaze.MazeSrv.isGroundChar(mapChar);
}

WebyMaze.MazeSrv.prototype.isPillChar	= function(x, y){
	var mapChar	= this.mapChar(x,y);
	return WebyMaze.MazeSrv.isPill(mapChar);
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


// export commonjs module
if( module && module.exports ){
	module.exports	= WebyMaze.MazeSrv;
}
