/** @namespace */
var WebyMaze	= WebyMaze || {};

//////////////////////////////////////////////////////////////////////////////////
//		ctor/dtor							//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.PillSrv	= function(opts){
	this.position	= opts.position	|| console.assert(false);
	this.rotation	= opts.rotation || console.assert(false);
	this.pillType	= opts.pillType	|| console.assert(false);
	this.bodyWidth	= 25;
	// FIXME check if this.bodyId is actually unique
	this.bodyId	= "pill-"+Math.floor(Math.random()*9999999).toString(36);
	this.speedFwd	= 10.0;
}

WebyMaze.PillSrv.prototype.destroy	= function(){
}

//////////////////////////////////////////////////////////////////////////////////
//		contants							//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.PillSrv.PillType	= {};
WebyMaze.PillSrv.PillType.white	= 'white';
WebyMaze.PillSrv.PillType.red	= 'red';


//////////////////////////////////////////////////////////////////////////////////
//		misc								//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.PillSrv.prototype.tick	= function(){
	// nothing happen as pills are static
}

WebyMaze.PillSrv.prototype.consumptionScore	= function(){
	if( this.pillType == WebyMaze.PillSrv.PillType.red ){
		return 10;		
	}else if( this.pillType == WebyMaze.PillSrv.PillType.white ){
		return 20;
	}else {
		console.assert(false, "unknown pillType "+this.pillType)
	}
}
//////////////////////////////////////////////////////////////////////////////////
//		renderInfo							//
//////////////////////////////////////////////////////////////////////////////////

/**
 * return a RenderInfoFull
*/
WebyMaze.PillSrv.prototype.renderInfoFull	= function(){
	return JSON.parse(JSON.stringify({
		position	: this.position,
		rotation	: this.rotation,
		pillType	: this.pillType,
		bodyId		: this.bodyId
	}));
}

/**
 * compute the RenderInfoDiff between 2 RenderInfoFull
*/
WebyMaze.PillSrv.prototype.renderInfoEqual	= function(full1, full2){
	if( full1.position.x	!== full2.position.x )	return false;
	if( full1.position.y	!== full2.position.y )	return false;
	if( full1.rotation.z	!== full2.rotation.z )	return false;
	if( full1.pillType	!== full2.pillType )	return false;
	if( full1.bodyId	!== full2.bodyId )	return false;
	return true;
}

/**
 * Build contextTick for this body
 * - only for backward compatibility
*/
WebyMaze.PillSrv.prototype.buildContextTick	= function(){
	return this.renderInfoFull();
}

//////////////////////////////////////////////////////////////////////////////////
//		commonjs exports						//
//////////////////////////////////////////////////////////////////////////////////

// export commonjs module
if( module && module.exports ){
	module.exports	= WebyMaze.PillSrv;
}
