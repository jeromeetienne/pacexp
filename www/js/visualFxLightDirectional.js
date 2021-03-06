/** @namespace */
var WebyMaze	= WebyMaze || {};

//////////////////////////////////////////////////////////////////////////////////
//		ctor/dtor							//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.VisualFxLightDirectional	= function(opts)
{
	this._direction	= opts.direction	|| console.assert(false);
	this._lightPool	= opts.lightPool	|| console.assert(false);	
	this._color	= opts.color		|| 0xffffff;
	this._intensity	= opts.intensity	|| 1;
	this._distance	= opts.distance		|| 0;
	this._timeToLive= opts.timeToLive	|| 0*1000;

	// build the light itself
	this._light	= this._lightPool.borrow('DirectionalLight');

	// set light parameters
	this._light.color	= new THREE.Color( this._color );
	this._light.intensity	= this._intensity;
	this._light.distance	= this._distance;		
	this._light.position.x	= this._direction.x;
	this._light.position.y	= this._direction.y;
	this._light.position.z	= this._direction.z;
	this._light.position.normalize();
	
	// set this._container
	this._container	= this._light;
}

/**
*/
WebyMaze.VisualFxLightDirectional.prototype.destroy	= function()
{
	// giveback this._light to this._lightPool
	this._lightPool.giveback(this._light);
}


// mixin MicroEvent 
MicroEvent.mixin(WebyMaze.VisualFxLightDirectional);

//////////////////////////////////////////////////////////////////////////////////
//		misc								//
//////////////////////////////////////////////////////////////////////////////////

/**
 * Return the object3d containing this one
*/
WebyMaze.VisualFxLightDirectional.prototype.obj3d	= function(){
	return this._container;
}

WebyMaze.VisualFxLightDirectional.prototype.tick	= function()
{
	// honor this._timeToLive if needed
	if( this._timeToLive ){
		var present	= new Date();
		var age		= present - this._createdAt;
		if( age > this._timeToLive )	this.trigger('autodestroy');		
	}
}
