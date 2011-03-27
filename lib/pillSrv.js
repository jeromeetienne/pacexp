var WebyMaze	= WebyMaze || {};

//////////////////////////////////////////////////////////////////////////////////
//		ctor/dtor							//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.PillSrv	= function(opts){
	this.position	= opts.position	|| console.assert(false);
	this.rotation	= opts.rotation || console.assert(false);
	this.pillType	= opts.pillType	|| console.assert(false);
	this.bodyWidth	= WebyMaze.PillSrv.bodyWidth;
	// FIXME check if this.bodyId is actually unique
	this.bodyId	= "pill-"+Math.floor(Math.random()*9999999).toString(36);
	this.speedFwd	= 10.0;
console.log("pillType", this.pillType)
}

WebyMaze.PillSrv.prototype.destroy	= function(){
}

//////////////////////////////////////////////////////////////////////////////////
//		contants							//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.PillSrv.PillType	= {};
WebyMaze.PillSrv.PillType.white	= 'white';
WebyMaze.PillSrv.PillType.red	= 'red';

WebyMaze.PillSrv.bodyWidth	= 25;	// TODO kludge


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

/**
 * Build contextTick for this body
*/
WebyMaze.PillSrv.prototype.buildContextTick	= function(){
	return {
		position	: this.position,
		rotation	: this.rotation,
		pillType	: this.pillType,
		bodyId		: this.bodyId
	};
}

//////////////////////////////////////////////////////////////////////////////////
//		commonjs exports						//
//////////////////////////////////////////////////////////////////////////////////

// export commonjs module
if( module && module.exports ){
	module.exports	= WebyMaze.PillSrv;
}
