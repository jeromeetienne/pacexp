/** @namespace */
var WebyMaze	= WebyMaze || {};

//////////////////////////////////////////////////////////////////////////////////
//		ctor/dtor							//
//////////////////////////////////////////////////////////////////////////////////

/**
 * contructor
*/
WebyMaze.VisualFxImpact	= function(opts)
{
	var position	= opts.position	 || console.assert(false);
	// build this._container
	var bodyW	= 25;
	var timeoutDelay= 1*1000;

	// build the timeout
	var geometry = new THREE.Sphere( bodyW*4, 16, 8 );
	var material	= [
		new THREE.MeshPhongMaterial( { ambient: 0x0088aa, color: 0xff5500, specular: 0x555555, shininess: 10 } ),
	]
	this._container	= new THREE.Mesh(geometry, material);

	this._container.position.x	= position.x;
	this._container.position.z	= position.y;

	// set the timeout
	console.log("syuper", this._timeoutCallback);
	this.timeoutId	= setTimeout(this._timeoutCallback.bind(this), timeoutDelay);
// TODO this timeout is nogood... it would be better to tick this event
// thus the visual effect can evolve in time
}

/**
*/
WebyMaze.VisualFxImpact.prototype.destroy	= function()
{
	// stop the timeout
	if( this.timeoutId ){
		clearTimeout(this.timeoutId);
		this.timeoutId	= null;
	}
}


// mixin MicroEvent 
MicroEvent.mixin(WebyMaze.VisualFxImpact);

//////////////////////////////////////////////////////////////////////////////////
//		misc								//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.VisualFxImpact.prototype.setCtxTick	= function(ctxTick)
{
	this._container.position.x	= ctxTick.position.x;
	this._container.position.z	= ctxTick.position.y;
}

WebyMaze.VisualFxImpact.prototype._timeoutCallback	= function()
{
	console.log("super Timeout")
	this.trigger('autodestroy')
}

/**
 * Return the object3d containing this one
*/
WebyMaze.VisualFxImpact.prototype.obj3d	= function(){
	return this._container;
}
