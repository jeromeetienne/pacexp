/** @namespace */
var WebyMaze	= WebyMaze || {};

//////////////////////////////////////////////////////////////////////////////////
//										//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.LightPool	= function(opts)
{
	// get info from parameters
	this._scene	= opts.scene		|| console.assert(false);
	var nAmbient	= opts.nAmbient		|| 0;
	var nDirectional= opts.nDirectional	|| 0;
	var nPoint	= opts.nPoint		|| 0;
	// init instance variables
	this._pool	= [];
	
	// init the pool
	for(var i = 0; i < nAmbient; i++)	this._createLight('AmbientLight')
	for(var i = 0; i < nDirectional; i++)	this._createLight('DirectionalLight')
	for(var i = 0; i < nPoint; i++)		this._createLight('PointLight')
}

WebyMaze.LightPool.prototype.destroy	= function()
{
	// destroy this._pool
	while( this._pool.length )	this._destroyLight(light)
}

//////////////////////////////////////////////////////////////////////////////////
//										//
//////////////////////////////////////////////////////////////////////////////////

/**
 * Create the THREE light and add it to the pool
*/
WebyMaze.LightPool.prototype._createLight	= function(lightClass)
{
	// get the class constructor
	var constructor	= THREE[lightClass];
	// actually build the light object
	var light	= new constructor();
	// add the light to the scene
	// NOTE: this is the key here, it must be done early... dunno why
	this._scene.addLight( light );

	// put the light in the pool
	this._pool.push(light);
}

WebyMaze.LightPool.prototype._destroyLight	= function(light)
{
	// remove this light from this._pool
	console.assert( this._pool.indexOf(light) !== -1 );
	this._pool.splice(this._pool.indexOf(light), 1);			

	// add the light to the scene
	// NOTE: this is the key here, it must be done early... dunno why
	this._scene.removeObject( light );
}

/**
 * Switch off the light
*/
WebyMaze.LightPool.prototype._switchOff	= function(light)
{
	light.color	= new THREE.Color( 0x000000 );
}

//////////////////////////////////////////////////////////////////////////////////
//										//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.LightPool.prototype.borrow	= function(lightClass)
{
	// get the class constructor
	var constructor	= THREE[lightClass];
	// try to find a light of this class
	var light	= null;
	for( var i = 0; i < this._pool.length; i++){
		if( this._pool[i] instanceof constructor )	break;
	}
	console.assert( i < this._pool.length )
	// get the light from this._pool
	var light	= this._pool[i];
	// remove the light from this._pool
	this._pool.splice(i,1);
	// return the light itself
	return light
}

WebyMaze.LightPool.prototype.giveback	= function(light)
{
	// switch off this light
	this._switchOff(light);
	// put the light in the pool
	this._pool.push(light);
}



