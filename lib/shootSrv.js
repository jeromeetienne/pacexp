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

//////////////////////////////////////////////////////////////////////////////////
//		renderInfo							//
//////////////////////////////////////////////////////////////////////////////////

/**
 * return a RenderInfoFull
*/
WebyMaze.ShootSrv.prototype.renderInfoFull	= function(){
	return {
		position	: this.position,
		rotation	: this.rotation,
		bodyId		: this.bodyId
	};
}

/**
 * compute the RenderInfoDiff between 2 RenderInfoFull
*/
WebyMaze.ShootSrv.renderInfoEqual	= function(full1, full2){
	if( full1.position.x	!== full2.position.x )	return false;
	if( full1.position.y	!== full2.position.y )	return false;
	if( full1.rotation.z	!== full2.position.z )	return false;
	if( full1.bodyId	!== full2.bodyId )	return false;
	return true;
}


/**
 * compute the RenderInfoDiff between 2 RenderInfoFull
 * - those function are generic and not dependant from ShootSrv
 * - TODO put it elsewhere
*/
WebyMaze.ShootSrv.renderInfoDiff	= function(full1, full2){
	if( this.renderInfoEqual(full1, full2) )	return null;
	return full2;
}

/**
 * patch a RenderInfoFull with a RenderInfoDiff
 * - those function are generic and not dependant from ShootSrv
 * - TODO put it elsewhere
*/
WebyMaze.ShootSrv.renderInfoPatch	= function(full, diff){
	console.assert(diff)
	return diff;
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
