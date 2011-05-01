var WebyMaze	= WebyMaze || {};

//////////////////////////////////////////////////////////////////////////////////
//		ctor/dtor							//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.PlayerCli	= function(){
	// put username/score to null, thus trigger change on next ctxTick
	this.username	= null;
	this.score	= null;
	this.energy	= null;
	
	this.dirtyScore	= false;
	this.dirtyEnergy= false;

	this._object3d	= new WebyMaze.Object3dPacky({
		appearance	: "happy-yellow-Packy"
	});
}

WebyMaze.PlayerCli.prototype.destroy	= function()
{	
}


//////////////////////////////////////////////////////////////////////////////////
//		tick stuff							//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.PlayerCli.prototype.setCtxTick	= function(ctxTick){
	var object3d	= this._object3d.object3d();	
	object3d.position.x	=  ctxTick.position.x;
	object3d.position.z	=  ctxTick.position.y;
	object3d.rotation.y	= -ctxTick.rotation.z;

	if(this.username != ctxTick.username ){
		this.username	= ctxTick.username
		this._object3d.setAppearance('happy-yellow-'+this.username);
	}
	if(this.score != ctxTick.score){
		this.score	= ctxTick.score
		this.dirtyScore	= true;
	}
	if(this.energy != ctxTick.energy){
		this.energy	= ctxTick.energy;
		this.dirtyEnergy= true;
	}
}

WebyMaze.PlayerCli.prototype.obj3d	= function(){
	return this._object3d.object3d();
}

