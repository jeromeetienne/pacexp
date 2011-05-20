/** @namespace */
var WebyMaze	= WebyMaze || {};

/**
 * Handle the map.
 *
 * TODO rename this mapSrv. same for client
*/
WebyMaze.MazeSrv	= function(opts)
{
	// get values from opts
	var levelIdx	= ('levelIdx' in opts) ? opts.levelIdx : console.assert(false);


	this.tileW	= 100;

	this.cubeW	= this.tileW;	// TODO rename this tileW

	// load local ConfigSrv
	this._config	= require('./configSrv').mazeSrv;


	this.maps	= {};
	this.maps['webglRocks']	= [
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
	this.maps['tweetymaze']	= [
		"**********************************",
		"*................................*",
		"*....*......................*....*",
		"*...**......................**...*",
		"*................................*",
		"*.....*..........................*",
		"*....*...........................*",
		"*....*.......**.**...............*",
		"*...........*.....*..............*",
		"*....********....................*",
		"*.................*..............*",
		"*....*.......**.**...............*",
		"*....*...........................*",
		"*................................*",
		"****.*.......................*...*",
		"*....**.....................*....*",
		"*.**.............................*",
		"*......*****.**..***********.....*",
		"*......*...*..*..................*",
		"*................................*",
		"**********************************",
	];
	this.maps['pacman1']	= [
	// Y:	 1111111110000000000
	//	 8765432109876543210	// X:
		"*******************",	// 00
		"*........*........*",	// 01
		"*.**.***.*.***.**.*",	// 02
		"*.**.***.*.***.**.*",	// 03
		"*.................*",	// 04
		"*.**.*.*****.*.**.*",	// 05
		"*....*...*...*....*",	// 06
		"****.***.*.***.****",	// 07
		"****.*.......*.****",	// 08
		"****.*.**.**.*.****",	// 09
		"*......*...*......*",	// 10
		"****.*.*****.*.****",	// 11
		"****.*.......*.****",	// 12
		"****.*.*****.*.****",	// 13
		"*........*........*",	// 14
		"*.**.***.*.***.**.*",	// 15
		"*..*...........*..*",	// 16
		"**.*.*.*****.*.*.**",	// 17
		"*....*...*...*....*",	// 18
		"*.******.*.******.*",	// 19
		"*.................*",	// 20
		"*******************",	// 21
	];
	this.maps['pacman2']	= [
	// Y:	 1111111110000000000
	//	 8765432109876543210	// X:
		"*******************",	// 00
		"*........*........*",	// 01
		"*.**.***.*.***.**.*",	// 02
		"*.**.***.*.***.**.*",	// 03
		"*.................*",	// 04
		"*.**.*.*****.*.**.*",	// 05
		"*....*...*...*....*",	// 06
		"****.***.*.***.****",	// 07
		"****.*.......*.****",	// 08
		"****.*.**.**.*.****",	// 09
		"*......*...*......*",	// 10
		"****.*********.****",	// 11
		"****.*.......*.****",	// 12
		"****.*.*****.*.****",	// 13
		"*........*........*",	// 14
		"*.**.***.*.***.**.*",	// 15
		"*..*...........*..*",	// 16
		"**.*.*.*****.*.*.**",	// 17
		"*....*...*...*....*",	// 18
		"*.******.*.******.*",	// 19
		"*.................*",	// 20
		"*******************",	// 21
	];

	this.map	= this.maps[this._config.mapType];
	
console.log("**************************************")
console.log("levelIdx", levelIdx);
	// TMP: just to test the multimap for pacman
	if( this._config.mapType ==='pacman1' ){
		if( levelIdx%2 === 0 ){
			this.map	= this.maps['pacman1']
		}else{
			this.map	= this.maps['pacman2']
		}
	}

	// rotate the map to make it appears the same in webgl
	this._rotateMap();
	
	// put pills everywhere
	if( this._config.dontFillPills === false )	this._fillPills();
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
	this.forEach(function(x, y){
// no white pills
//return;
		//if(x % 2 === y % 2)	return;
		if(y % 2)	return;
		var tileValue	= this.tileValue(x,y);
		if( WebyMaze.MazeSrv.isGroundChar(tileValue) ){
			this.tileValue(x,y, "w");
		}
	}.bind(this))

	this.tileValue(2,1, "r");
	this.tileValue(2,17, "r");
	this.tileValue(16,1, "r");
	this.tileValue(16,17, "r");
}

WebyMaze.MazeSrv.prototype.consoleDump	= function()
{
	this.forEach(function(x, y){
		var tileValue	= this.tileValue(x,y);
		process.stdout.write( tileValue );
		if( x === this.mapW()-1 )	console.log("")
	}.bind(this))
}

//////////////////////////////////////////////////////////////////////////////////
//		misc								//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.MazeSrv.prototype.getMap	= function(){
	return this.map;
}

WebyMaze.MazeSrv.prototype.tileValue	= function(x, y, val)
{
	console.assert(x >= 0);
	console.assert(x < this.mapW() );
	console.assert(y >= 0);
	console.assert(y < this.mapH() );
	if( typeof val !== 'undefined' ){
		this.map[y]	= this.map[y].slice(0, x) + val + this.map[y].slice(x+1);
		//console.log("x", x, "y", y, "val", val, this.map)
	}
	return this.map[y][x];
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


WebyMaze.MazeSrv.prototype.space2mapX	= function(spaceX)
{
	return	Math.floor(spaceX / this.tileW) + Math.floor(this.mapW()/2)
}

WebyMaze.MazeSrv.prototype.space2mapY	= function(spaceY)
{
	return	Math.floor(spaceY / this.tileW) + Math.floor(this.mapH()/2)
}


//////////////////////////////////////////////////////////////////////////////////
//		mapchar								//
//////////////////////////////////////////////////////////////////////////////////

/**
 * Re
*/
WebyMaze.MazeSrv.prototype.findRandomType	= function(tileFilter)
{
	// FIXME this could loop for ever
	var maxIter	= 100;
	for(var i = 0; i < maxIter; i++ ){
		var mapX	= Math.floor(Math.random() * this.mapW())
		var mapY	= Math.floor(Math.random() * this.mapH())
		var tileValue	= this.tileValue(mapX, mapY);
		if( tileFilter(tileValue) === true )	break;
	}
	console.assert( i < maxIter, "findRandomType loop more than maxIter("+maxIter+")");
	return { x: mapX, y: mapY };
}

WebyMaze.MazeSrv.prototype.findRandomWall	= function()
{
	return this.findRandomType(WebyMaze.MazeSrv.isWallChar);
}

WebyMaze.MazeSrv.prototype.findRandomGround	= function()
{
	return this.findRandomType(WebyMaze.MazeSrv.isGroundChar);
}

WebyMaze.MazeSrv.prototype.findRandomPill	= function()
{
	return this.findRandomType(WebyMaze.MazeSrv.isPillChar);
}
//////////////////////////////////////////////////////////////////////////////////
//		mapchar								//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.MazeSrv.prototype.forEach	= function(callback)
{
	for( var y = 0; y < this.mapH(); y++ ){
		for( var x = 0; x < this.mapW(); x++ ){
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
	return WebyMaze.MazeSrv.isPillChar(mapChar);
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
	console.assert(false, "unknown mazeChar "+mazeChar)
	return undefined;
}


//////////////////////////////////////////////////////////////////////////////////
//		commonjs exports						//
//////////////////////////////////////////////////////////////////////////////////

// export in common js
if( typeof module !== "undefined" && ('exports' in module)){
	module.exports	= WebyMaze.MazeSrv;
}
