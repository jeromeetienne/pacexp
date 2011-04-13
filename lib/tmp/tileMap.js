/** @namespace */
var WebyMaze	= WebyMaze || {};

//////////////////////////////////////////////////////////////////////////////////
//		TileType							//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.TileType	= function(){
}

WebyMaze.TileType.prototype.addAttr	= function(type, attr)
{
	if( type in this.types === false )
		this.types[type]	= [];
	console.assert(this.hasAttr(type, attr) === false)
	this.types[type].push(attr)
}

WebyMaze.TileType.prototype.hasAttr	= function(type, attr)
{
	if( type in this.types === false )	return false;
	return this.types[type].indexOf(attr) !== -1  ? true : false;
}

WebyMaze.TileType.prototype.delAttr	= function(type, attr)
{
	var idx	= this.types[type].indexOf(attr);
	if( idx === -1 )	return;
	this.types.splice(idx, 1);
}

//////////////////////////////////////////////////////////////////////////////////
//		TileMap								//
//////////////////////////////////////////////////////////////////////////////////

/**
 * Handle a generic map with tile
*/
WebyMaze.TileMap	= function(opts)
{
	this.mapW	= opts.mapW	|| console.assert(false);
	this.mapH	= opts.mapH	|| console.assert(false);
	
	// build mapData
	this.mapData	= []
	for(var mapX = 0; mapX < this.mapW; mapX++ ){
		this.mapData[mapX]	= new Array(this.mapH);
		for(var mapY = 0; mapY < this.mapH; mapY++ ){
			this.mapData[mapX][mapY]	= 0;
		}		
	}

	
	// each tile got a value
	// it is possible to attach property to value
}

WebyMaze.TileMap.cardsOffset	= {
	east	: {x:+1, y: 0},
	north	: {x: 0, y:-1},
	west	: {x:-1, y: 0},
	south	: {x: 0, y:+1}
};

WebyMaze.TileMap.cardsOpposite	= {
	east	: 'west',
	north	: 'south',
	west	: 'east',
	south	: 'north'
};

WebyMaze.TileMap.direction2angle	= {
	east	: 0,
	north	: Math.PI/2,
	west	: Math.PI,
	south	: 3*Math.PI/2
};

WebyMaze.TileMap.angle2direction	= {}
WebyMaze.TileMap.angle2direction[WebyMaze.TileMap.direction2angle['east']]	= 'east';
WebyMaze.TileMap.angle2direction[WebyMaze.TileMap.direction2angle['north']]	= 'north';
WebyMaze.TileMap.angle2direction[WebyMaze.TileMap.direction2angle['west']]	= 'west';
WebyMaze.TileMap.angle2direction[WebyMaze.TileMap.direction2angle['south']]	= 'south';

/**
 * Getter/setter for a tile
*/
WebyMaze.TileMap.prototype.tile	= function(x,y, val)
{
	console.assert(this.withinMap(x,y), "coord out of map x:"+x+" y:"+y )
	if( typeof val !== 'undefined' )	this.mapData[x][y] = val;
	return this.mapData[x][y];
}

/**
 * Getter/setter for a tile
*/
WebyMaze.TileMap.prototype.withinMap	= function(x,y)
{
	if( x < 0 )		return false;
	if( x >= this.mapW )	return false;
	if( y < 0 )		return false;
	if( y >= this.mapH )	return false;
	return true;
}

/**
 * Setter for a tile/property
*/
WebyMaze.TileMap.prototype.value2Class	= function(tileValue, property)
{
	if( property in properties === false )	properties[property]	= [];
	console.assert( this.propertyHas(tileValue, property) === false )
	properties[property].push(tileValue);
}

/**
 * Getter/setter for a tile
*/
WebyMaze.TileMap.prototype.propertyHas	= function(tileValue, property)
{
	if( property in properties === false )	return false;
	return properties[property].indexOf(tileValue) != -1 ? true : false;
}

WebyMaze.TileMap.prototype.forEach	= function(callback)
{
	for( var y = 0; y < this.mapH; y++ ){
		for( var x = 0; x < this.mapW; x++ ){
			var stopnow	= callback(x, y, this.tile(x, y));
			if( stopnow)	return;
		}
	}
}

WebyMaze.TileMap.prototype.consoleDump	= function()
{
	for(var y = 0; y < this.mapH; y++ ){
		for(var x = 0; x < this.mapW; x++ ){
			var str	= this.tile(x, y).toString()
			if( str.length < 4 )	str += " ";
			if( str.length < 4 )	str += " ";
			if( str.length < 4 )	str += " ";
			if( str.length < 4 )	str += " ";
			process.stdout.write( str );
		}
		console.log("");
	}
}

/**
 * TODO to remove... i believe this is unused
*/
WebyMaze.TileMap.prototype.fill	= function(tileValue)
{
	for(var mapX = 0; mapX < this.mapW; mapX++ ){
		for(var mapY = 0; mapY < this.mapH; mapY++ ){
			this.mapData[mapX][mapY]	= tileValue;
		}		
	}
}

/**
 * Nothing really defined... but import well the mazeSrv map
*/
WebyMaze.TileMap.importMazeSrv	= function(mazeSrv)
{
	var tileMap	= new WebyMaze.TileMap({
		mapW	: mazeSrv.mapW(),
		mapH	: mazeSrv.mapH()
	});
	mazeSrv.forEach(function(x, y){
		var tileValue	= mazeSrv.tileValue(x,y);
		tileMap.tile(x, y, tileValue)
	});
	return tileMap;
}

/**
 * Nothing really defined... but import well the mazeSrv map
*/
WebyMaze.TileMap.importTileMap	= function(srcMap)
{
	var tileMap	= new WebyMaze.TileMap({
		mapW	: srcMap.mapW,
		mapH	: srcMap.mapH
	});
	for(var y = 0; y < srcMap.mapH; y++ ){
		for(var x = 0; x < srcMap.mapW; x++ ){
			var tileValue	= srcMap.tile(x,y);
			tileMap.tile(x, y, srcMap.tile(x,y));
		}
	}
	return tileMap;
}

//////////////////////////////////////////////////////////////////////////////////
//		commonjs exports						//
//////////////////////////////////////////////////////////////////////////////////

// export in common js
if( typeof module !== "undefined" && ('exports' in module)){
	module.exports	= WebyMaze.TileMap;
}

