/** @namespace */
var WebyMaze	= WebyMaze || {};

//////////////////////////////////////////////////////////////////////////////////
//		ctor/dtor							//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.ShootSrv	= function(opts){
	this.position	= opts.position		|| console.assert(false);
	this.rotation	= opts.rotation		|| console.assert(false);
	this._srcBodyId	= opts.srcBodyId	|| console.assert(false);
	this._timeToLive= opts.timeToLive	|| 1.0*1000;
	this.bodyW	= 25;
	// FIXME check if this.bodyId is actually unique
	this.bodyId	= "shoot-"+Math.floor(Math.random()*9999999).toString(36);
	this.speedFwd	= 10.0;

	// store this._createdAt to honor this._timeToLive
	this._createdAt	= new Date;
}

WebyMaze.ShootSrv.prototype.destroy	= function(){
}

WebyMaze.ShootSrv.bodyW	= 25;

require('./microevent').mixin(WebyMaze.ShootSrv)

//////////////////////////////////////////////////////////////////////////////////
//		misc								//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.ShootSrv.prototype.tick	= function(timings)
{
	var speed	= this.speedFwd * timings.nQuantum;
	this.position.x += Math.cos(this.rotation.z) * speed;
	this.position.y += Math.sin(this.rotation.z) * speed;

	// honor this._timeToLive if needed
	if( this._timeToLive ){
		var present	= new Date();
		var age		= present - this._createdAt;
		if( age > this._timeToLive )	this.trigger('autodestroy');
	}
}

WebyMaze.ShootSrv.prototype.srcBodyId	= function()
{
	return this._srcBodyId;
}

//////////////////////////////////////////////////////////////////////////////////
//		renderInfo							//
//////////////////////////////////////////////////////////////////////////////////

/**
 * return a RenderInfoFull
*/
WebyMaze.ShootSrv.prototype.renderInfoFull	= function(){
	return JSON.parse(JSON.stringify({
		position	: this.position,
		rotation	: this.rotation,
		bodyId		: this.bodyId
	}));
}

/**
 * compute the RenderInfoDiff between 2 RenderInfoFull
*/
WebyMaze.ShootSrv.prototype.renderInfoEqual	= function(full1, full2)
{
	if( full1.position.x	!== full2.position.x )	return false;
	if( full1.position.y	!== full2.position.y )	return false;
	if( full1.rotation.z	!== full2.rotation.z )	return false;
	if( full1.bodyId	!== full2.bodyId )	return false;
	return true;
}

/**
 * Build contextTick for this body
 * - only for backward compatibility
*/
WebyMaze.ShootSrv.prototype.buildContextTick	= function(){
	return this.renderInfoFull();
}

//////////////////////////////////////////////////////////////////////////////////
//		commonjs exports						//
//////////////////////////////////////////////////////////////////////////////////

// export commonjs module
if( module && module.exports ){
	module.exports	= WebyMaze.ShootSrv;
}
