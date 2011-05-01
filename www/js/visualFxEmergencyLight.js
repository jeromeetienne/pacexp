/** @namespace */
var WebyMaze	= WebyMaze || {};

//////////////////////////////////////////////////////////////////////////////////
//		ctor/dtor							//
//////////////////////////////////////////////////////////////////////////////////

/**
 * contructor
 * 
 * TODO make an animation
 * - 2 tweens... one on the scale to make the sphere grow
 * - one to change the opacity
 * - maybe several spheres to give an impression of smoke
*/
WebyMaze.VisualFxEmergencyLight	= function(opts)
{
	var position	= opts.position		|| console.assert(false);
	this._timeToLive= opts.timeToLive	|| 1*1000;


	// add a pointLight to experiment with it
	var light	= new THREE.PointLight( 0xFF0000, 10, 1500 );
	light.position.x = position.x;
	light.position.y = position.y;
	light.position.z = position.z;

/**
 * make a pool of pointLight at the begining
 * - object3d pool ?
*/

	this._container	= light;
}

/**
*/
WebyMaze.VisualFxEmergencyLight.prototype.destroy	= function()
{
}


// mixin MicroEvent 
MicroEvent.mixin(WebyMaze.VisualFxEmergencyLight);

//////////////////////////////////////////////////////////////////////////////////
//		misc								//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.VisualFxEmergencyLight.prototype.tick	= function()
{
	// honor this._timeToLive if needed
	if( this._timeToLive ){
		var present	= new Date();
		var age		= present - this._createdAt;
		if( age > this._timeToLive )	this.trigger('autodestroy');		
	}
}

/**
 * Return the object3d containing this one
*/
WebyMaze.VisualFxEmergencyLight.prototype.obj3d	= function(){
	return this._container;
}
