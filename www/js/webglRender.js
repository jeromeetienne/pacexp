var WebyMaze	= WebyMaze || {};

//////////////////////////////////////////////////////////////////////////////////
//		ctor/dtor							//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.WebglRender	= function(opts){
	var ctxInit	= opts.ctxInit	|| console.assert(false);

	// init this.mazeCli
	this.mazeCli	= new WebyMaze.MazeCli({
		map	: ctxInit.map
	})
	// update the global scene with this.mazeCli
	scene.addObject( this.mazeCli.buildObject3d() );

	this.players	= {};
	this.shoots	= {};
}

WebyMaze.WebglRender.prototype.destroy	= function(){
	this.mazeCli.destroy();
}

//////////////////////////////////////////////////////////////////////////////////
//		misc								//
//////////////////////////////////////////////////////////////////////////////////

var proutprout	= false;
WebyMaze.WebglRender.prototype.setCtxTick	= function(ctxTick){
	//console.log("ctxTick", ctxTick.players)
	
	// handle ctxTick.players
	ctxTick.players.forEach(function(player){
		var bodyId	= player.bodyId;
		// if it already exist, 
		if( bodyId in this.players ){
			//console.log("update player", JSON.stringify(player))
			this.players[bodyId].setCtxTick(player)
			return;
		}
		console.log("create player", JSON.stringify(player))
		// create WebyMaze.PlayerCli
		this.players[bodyId]	= new WebyMaze.PlayerCli({
			position	: player.position,
			rotation	: player.rotation
		});
		// add this body to the scene
		scene.addObject( this.players[bodyId].getObject3d() );
	}.bind(this));

	// handle ctxTick.shoots
	ctxTick.shoots.forEach(function(shoot){
		var bodyId	= shoot.bodyId;
		// if it already exist, 
		if( bodyId in this.shoots ){
			//console.log("update shoot", JSON.stringify(shoot))
			this.shoots[bodyId].setCtxTick(shoot)
			return;
		}
		console.log("create shoot", JSON.stringify(shoot))
		// create WebyMaze.shootCli
		this.shoots[bodyId]	= new WebyMaze.ShootCli({
			position	: shoot.position,
			rotation	: shoot.rotation
		});
		// add this body to the scene
		scene.addObject( this.shoots[bodyId].getObject3d() );
	}.bind(this));
	
	Object.keys(this.shoots).forEach(function(bodyId){
		for(var i = 0; i < ctxTick.shoots.length; i++){
			var shoot	= ctxTick.shoots[i];
			if( bodyId === shoot.bodyId ) return;
		}
		console.log("delete shoot", bodyId)
		scene.removeObject( this.shoots[bodyId].getObject3d() );
		this.shoots[bodyId].destroy();
		delete this.shoots[bodyId];
	}.bind(this));

}
