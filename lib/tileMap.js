/** @namespace */
var WebyMaze	= WebyMaze || {};

//////////////////////////////////////////////////////////////////////////////////
//		TileType							//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.TileType	= function(){
	this.types	= { /* type : ['attr1', 'attr2', ...] */
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
WebyMaze.TileMap	= function(opts){
	this.mapW	= opts.mapW	|| console.assert(false);
	this.mapH	= opts.mapH	|| console.assert(false);
	this.mapData	= WebyMaze.TileMap.build(this.mapW, this.mapH)
	
	// each tile got a value
	// it is possible to attach property to value
}

/**
 * Getter/setter for a tile
*/
WebyMaze.TileMap.prototype.tile	= function(x,y, val)
{
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


WebyMaze.TileMap.prototype.distMax	= function()
{
	return this.mapW * this.mapH;
}

WebyMaze.TileMap.buildRaw	= function(value)
{
	var data	= [];
	for(var mapX = 0; mapX < mapW; mapX++ ){
		distMap[mapX]	= new Array(mapH);
		for(var mapY = 0; mapY < mapH; mapY++ ){
			data[mapX][mapY]	= value;
		}		
	}
	return data;
}

//////////////////////////////////////////////////////////////////////////////////
//		commonjs exports						//
//////////////////////////////////////////////////////////////////////////////////

// export in common js
if( typeof module !== "undefined" && ('exports' in module)){
	module.exports	= WebyMaze.TileMap;
}

