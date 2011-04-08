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
	this.dflTile	= opts.dflTile	|| 0;
	
	// build mapData
	this.mapData	= []
	for(var mapX = 0; mapX < this.mapW; mapX++ ){
		this.mapData[mapX]	= new Array(this.mapH);
		for(var mapY = 0; mapY < this.mapH; mapY++ ){
			this.mapData[mapX][mapY]	= this.dflTile;
		}		
	}

	
	// each tile got a value
	// it is possible to attach property to value
}

WebyMaze.TileMap.cardsOffset	= {
	east	: {x:+1, y:0},
	north	: {x: 0, y: -1},
	west	: {x:-1, y:0},
	south	: {x:0, y:+1}
};


/**
 * Getter/setter for a tile
*/
WebyMaze.TileMap.prototype.tile	= function(x,y, val)
{
	console.assert( x >= 0 );
	console.assert( x < this.mapW );
	console.assert( y >= 0 );
	console.assert( y < this.mapH );
	if( typeof val !== 'undefined' ){
		this.mapData[x][y]	= val;
	}
	return this.mapData[x][y];
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
	for( var x = 0; x < this.mapW; x++ ){
		for( var y = 0; y < this.mapH; y++ ){
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
			if( str.length < 3 )	str += " ";
			if( str.length < 3 )	str += " ";
			process.stdout.write( str );
		}
		console.log("");
	}
}

WebyMaze.TileMap.fill	= function(tileValue)
{
	for(var mapX = 0; mapX < mapW; mapX++ ){
		for(var mapY = 0; mapY < mapH; mapY++ ){
			this.mapData[mapX][mapY]	= tileValue;
		}		
	}
}

/**
 * Nothing really defined... but import well the mazeSrv map
*/
WebyMaze.TileMap.importAscii	= function(mapAscii)
{
	var mapW	= mapAscii.length;
	var mapH	= mapAscii[0].length;

	var tileMap	= new WebyMaze.TileMap({
		mapW	: mapW,
		mapH	: mapH
	});
	for(var y = 0; y < mapH; y++ ){
		for(var x = 0; x < mapW; x++ ){
			var tileValue	= mapAscii[x][y];
			tileMap.tile(x, y, tileValue);
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

