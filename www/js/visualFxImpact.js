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
WebyMaze.VisualFxImpact	= function(opts)
{
	var position	= opts.position		|| console.assert(false);
	this._timeToLive= opts.timeToLive	|| 1*1000;
	this._bodyW	= opts._bodyW		|| 200;

	// store this._createdAt to honor this._timeToLive
	this._createdAt	= new Date;

	// build this._container
	var geometry	= new THREE.Sphere( this._bodyW/2, 32, 16 );
	var material	= [
		new THREE.MeshLambertMaterial( { color: 0xFFFFFF, shading: THREE.SmoothShading, opacity: 0.3} )
		//new THREE.MeshPhongMaterial( { ambient: 0x0088aa, color: 0xff5500, specular: 0x555555, shininess: 10, opacity : 0.5 } ),
	]
	this._container	= new THREE.Mesh(geometry, material);
	this._container.position.x	= position.x;
	this._container.position.z	= position.y;
}

/**
*/
WebyMaze.VisualFxImpact.prototype.destroy	= function()
{
}

// mixin MicroEvent 
MicroEvent.mixin(WebyMaze.VisualFxImpact);

//////////////////////////////////////////////////////////////////////////////////
//		misc								//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.VisualFxImpact.prototype.tick	= function()
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
WebyMaze.VisualFxImpact.prototype.obj3d	= function(){
	return this._container;
}
