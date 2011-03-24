var WebyMaze	= WebyMaze || {};

/**
 * TODO
 * - 
 * - comment this code
 *   - reproduce the structure in shoot and player
*/

WebyMaze.PillSrv	= function(opts){
	this.position	= opts.position	|| console.assert(false);
	this.rotation	= opts.rotation || console.assert(false);
	this.bodyWidth	= WebyMaze.PillSrv.bodyWidth;
	// FIXME check if this.bodyId is actually unique
	this.bodyId	= "pill-"+Math.floor(Math.random()*9999999).toString(36);
	this.speedFwd	= 10.0;
}


WebyMaze.PillSrv.bodyWidth	= 25;	// TODO kludge


WebyMaze.PillSrv.prototype.destroy	= function(){
}


WebyMaze.PillSrv.prototype.tick	= function(){
	// nothing happen as pills are static
}

// export commonjs module
if( module && module.exports ){
	module.exports	= WebyMaze.PillSrv;
}
