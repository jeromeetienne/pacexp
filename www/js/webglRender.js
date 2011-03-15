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
	sceneContainer.addChild( this.mazeCli.buildObject3d() );

	this.urBodyId	= ctxInit.urBodyId;
	this.players	= {};
	this.shoots	= {};
}

WebyMaze.WebglRender.prototype.destroy	= function(){
	this.mazeCli.destroy();
}

//////////////////////////////////////////////////////////////////////////////////
//		misc								//
//////////////////////////////////////////////////////////////////////////////////

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
		sceneContainer.addChild( this.players[bodyId].getObject3d() );
	}.bind(this));

	Object.keys(this.players).forEach(function(bodyId){
		for(var i = 0; i < ctxTick.players.length; i++){
			var player	= ctxTick.players[i];
			if( bodyId === player.bodyId ) return;
		}
		console.log("delete player", bodyId)
		scene.removeObject( this.players[bodyId].getObject3d() );
		this.players[bodyId].destroy();
		delete this.players[bodyId];
	}.bind(this));

	//this.mazeCli.group.rotation.z	= Math.sin( new Date().getTime() * 0.0003 ) * 0.5;
	//this.mazeCli.group.rotation.z	= (clientX%360)*Math.PI/180;
	//sceneContainer.position.z	= 4000+clientY*10;
	//sceneContainer.rotation.x	= 100*Math.PI/180;
	//sceneContainer.position.z	= 4800;
	
	//camera.target.rotation.z = 90;

	//var myBodyId	= Object.keys(this.players)[0];
	var myPlayer	= this.players[this.urBodyId];
	//
	//this.mazeCli.group.rotation.z	= myPlayer.mesh.rotation.z;
	
	//sceneContainer.position.x	= -myPlayer.mesh.position.x;
	//sceneContainer.position.y	= -myPlayer.mesh.position.y;
	//sceneContainer.rotation.z	= -myPlayer.mesh.rotation.z;
	//
	//
	//sceneContainer.rotation.x = - 90 * Math.PI / 180;
	
	if(true){
		myPlayer.mesh.addChild( camera )
	}else{
		camera.position.x = myPlayer.mesh.position.x;
		//camera.position.y = myPlayer.mesh.position.y;
		camera.position.z = myPlayer.mesh.position.z-500;
	
		//camera.target.position.x = myPlayer.mesh.position.x;
		//camera.target.position.y = myPlayer.mesh.position.y;
		//camera.target.position.z = myPlayer.mesh.position.z;
		
		//camera.target.lookAt(myPlayer.mesh.position);		
	}
	
	

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
		sceneContainer.addChild( this.shoots[bodyId].getObject3d() );
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
