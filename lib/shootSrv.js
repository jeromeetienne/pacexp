var WebyMaze	= WebyMaze || {};

WebyMaze.ShootSrv	= function(opts){
	this.position	= opts.position	|| console.assert(false);
	this.rotation	= opts.rotation || console.assert(false);
	this.bodyWidth	= WebyMaze.ShootSrv.bodyWidth;
	// FIXME check if this.bodyId is actually unique
	this.bodyId	= "shoot-"+Math.floor(Math.random()*9999999).toString(36);
	this.speedFwd	= 3.0;
}


WebyMaze.ShootSrv.bodyWidth	= 50;	// TODO kludge


WebyMaze.ShootSrv.prototype.destroy	= function(){
}


WebyMaze.ShootSrv.prototype.tick	= function(){
	this.position.x += Math.cos(this.rotation.z)*this.speedFwd;
	this.position.y += Math.sin(this.rotation.z)*this.speedFwd;
}

// export commonjs module
if( module && module.exports ){
	module.exports	= WebyMaze.ShootSrv;
}
