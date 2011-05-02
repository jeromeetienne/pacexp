/** @namespace */
var WebyMaze	= WebyMaze || {};

//////////////////////////////////////////////////////////////////////////////////
//		ctor/dtor							//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.VisualFxPointLight	= function(opts)
{
	this._position	= opts.position		|| console.assert(false);
	this._color	= opts.color		|| 0xffffff;
	this._intensity	= opts.intensity	|| 1;
	this._distance	= opts.distance		|| 0;
	this._timeToLive= opts.timeToLive	|| 0*1000;
	
	// build the light itself
	this._light	= new THREE.PointLight( this._color, this._intensity, this._distance );
	this._light.position.x = this._position.x;
	this._light.position.y = this._position.y;
	this._light.position.z = this._position.z;
	
	// set this._container
	this._container	= this._light;
}

/**
*/
WebyMaze.VisualFxPointLight.prototype.destroy	= function()
{
}


// mixin MicroEvent 
MicroEvent.mixin(WebyMaze.VisualFxPointLight);

//////////////////////////////////////////////////////////////////////////////////
//		misc								//
//////////////////////////////////////////////////////////////////////////////////

/**
 * Return the object3d containing this one
*/
WebyMaze.VisualFxPointLight.prototype.obj3d	= function(){
	return this._container;
}

WebyMaze.VisualFxPointLight.prototype.tick	= function()
{
	// honor this._timeToLive if needed
	if( this._timeToLive ){
		var present	= new Date();
		var age		= present - this._createdAt;
		if( age > this._timeToLive )	this.trigger('autodestroy');		
	}
}