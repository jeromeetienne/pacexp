/** @namespace */
var WebyMaze	= WebyMaze || {};

//////////////////////////////////////////////////////////////////////////////////
//		ctor/dtor							//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.VisualFxLightPoint	= function(opts)
{
	this._lightPool	= opts.lightPool	|| console.assert(false);
	this._position	= opts.position		|| console.assert(false);
	this._color	= opts.color		|| 0xffffff;
	this._intensity	= opts.intensity	|| 1;
	this._distance	= opts.distance		|| 0;
	this._timeToLive= opts.timeToLive	|| 0*1000;
	
	// build the light itself
	this._light	= this._lightPool.borrow('PointLight');
	
	// set light parameters	
	this._light.color	= new THREE.Color( this._color );
	this._light.intensity	= this._intensity;
	this._light.distance	= this._distance;
	this._light.position.x	= this._position.x;
	this._light.position.y	= this._position.y;
	this._light.position.z	= this._position.z;
	
	// set this._container
	this._container	= this._light;
}

/**
*/
WebyMaze.VisualFxLightPoint.prototype.destroy	= function()
{
	// giveback this._light to this._lightPool
	this._lightPool.giveback(this._light);
}


// mixin MicroEvent 
MicroEvent.mixin(WebyMaze.VisualFxLightPoint);

//////////////////////////////////////////////////////////////////////////////////
//		misc								//
//////////////////////////////////////////////////////////////////////////////////

/**
 * Return the object3d containing this one
*/
WebyMaze.VisualFxLightPoint.prototype.obj3d	= function(){
	return this._container;
}

WebyMaze.VisualFxLightPoint.prototype.tick	= function()
{
	// honor this._timeToLive if needed
	if( this._timeToLive ){
		var present	= new Date();
		var age		= present - this._createdAt;
		if( age > this._timeToLive )	this.trigger('autodestroy');		
	}
}
