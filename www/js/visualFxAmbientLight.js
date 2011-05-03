/** @namespace */
var WebyMaze	= WebyMaze || {};

//////////////////////////////////////////////////////////////////////////////////
//		ctor/dtor							//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.VisualFxAmbientLight	= function(opts)
{
	this._color	= opts.color		|| console.assert(false);
	this._lightPool	= opts.lightPool	|| console.assert(false);
	this._timeToLive= opts.timeToLive	|| 0*1000;

	// create the light
	if( false ){
		this._light	= new THREE.AmbientLight( this._color );		
	}else{
		this._light	= this._lightPool.borrow('AmbientLight');
		this._light.color	= new THREE.Color( this._color );		
	}


	// set this._container
	this._container	= this._light;
}

/**
*/
WebyMaze.VisualFxAmbientLight.prototype.destroy	= function()
{
}


// mixin MicroEvent 
MicroEvent.mixin(WebyMaze.VisualFxAmbientLight);

//////////////////////////////////////////////////////////////////////////////////
//		misc								//
//////////////////////////////////////////////////////////////////////////////////

/**
 * Return the object3d containing this one
*/
WebyMaze.VisualFxAmbientLight.prototype.obj3d	= function(){
	return this._container;
}

WebyMaze.VisualFxAmbientLight.prototype.tick	= function()
{
	// honor this._timeToLive if needed
	if( this._timeToLive ){
		var present	= new Date();
		var age		= present - this._createdAt;
		if( age > this._timeToLive )	this.trigger('autodestroy');		
	}
}
