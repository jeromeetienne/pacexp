/** @namespace */
var WebyMaze	= WebyMaze || {};

//////////////////////////////////////////////////////////////////////////////////
//		ctor/dtor							//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.VisualFxLightAmbient	= function(opts)
{
	this._color	= opts.color		|| console.assert(false);
	this._lightPool	= opts.lightPool	|| console.assert(false);
	this._timeToLive= opts.timeToLive	|| 0*1000;

	// build the light itself	
	this._light	= this._lightPool.borrow('AmbientLight');
	// set light parameters
	this._light.color	= new THREE.Color( this._color );		

	// set this._container
	this._container	= this._light;
}

/**
*/
WebyMaze.VisualFxLightAmbient.prototype.destroy	= function()
{
	// giveback this._light to this._lightPool
	this._lightPool.giveback(this._light);	
}


// mixin MicroEvent 
MicroEvent.mixin(WebyMaze.VisualFxLightAmbient);

//////////////////////////////////////////////////////////////////////////////////
//		misc								//
//////////////////////////////////////////////////////////////////////////////////

/**
 * Return the object3d containing this one
*/
WebyMaze.VisualFxLightAmbient.prototype.obj3d	= function(){
	return this._container;
}

WebyMaze.VisualFxLightAmbient.prototype.tick	= function()
{
	// honor this._timeToLive if needed
	if( this._timeToLive ){
		var present	= new Date();
		var age		= present - this._createdAt;
		if( age > this._timeToLive )	this.trigger('autodestroy');		
	}
}
