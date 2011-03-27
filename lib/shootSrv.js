var WebyMaze	= WebyMaze || {};

//////////////////////////////////////////////////////////////////////////////////
//		ctor/dtor							//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.ShootSrv	= function(opts){
	this.position	= opts.position	|| console.assert(false);
	this.rotation	= opts.rotation || console.assert(false);
	this.bodyWidth	= WebyMaze.ShootSrv.bodyWidth;
	// FIXME check if this.bodyId is actually unique
	this.bodyId	= "shoot-"+Math.floor(Math.random()*9999999).toString(36);
	this.speedFwd	= 10.0;
}

WebyMaze.ShootSrv.prototype.destroy	= function(){
}

//////////////////////////////////////////////////////////////////////////////////
//		contants							//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.ShootSrv.bodyWidth	= 25;	// TODO kludge


//////////////////////////////////////////////////////////////////////////////////
//		misc								//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.ShootSrv.prototype.tick	= function(){
	this.position.x += Math.cos(this.rotation.z)*this.speedFwd;
	this.position.y += Math.sin(this.rotation.z)*this.speedFwd;
}

/**
 * Build contextTick for this body
*/
WebyMaze.ShootSrv.prototype.buildContextTick	= function(){
	return {
		position	: this.position,
		rotation	: this.rotation,
		bodyId		: this.bodyId
	};
}

//////////////////////////////////////////////////////////////////////////////////
//		commonjs exports						//
//////////////////////////////////////////////////////////////////////////////////

// export commonjs module
if( module && module.exports ){
	module.exports	= WebyMaze.ShootSrv;
}
