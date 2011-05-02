var WebyMaze	= WebyMaze || {};

//////////////////////////////////////////////////////////////////////////////////
//		ctor/dtor							//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.EnemyCli	= function()
{
	if( false ){
		this._object3d	= new WebyMaze.Object3dGhost();
	}else{
		this._object3d	= new WebyMaze.Object3dPacky({
			appearance	: "happy-yellow-Packy"
		});		
	}
}

WebyMaze.EnemyCli.prototype.destroy	= function(){
}

//////////////////////////////////////////////////////////////////////////////////
//		misc								//
//////////////////////////////////////////////////////////////////////////////////


WebyMaze.EnemyCli.prototype.setCtxTick	= function(ctxTick)
{
	if( this._object3d instanceof WebyMaze.Object3dGhost ){
		if( this._object3d.getAppearance() != ctxTick.appearance ){
			console.log("enemey appearance change from ", this._object3d.getAppearance(), "to", ctxTick.appearance)
			this._object3d.setAppearance( ctxTick.appearance );
		}
	}else if( this._object3d instanceof WebyMaze.Object3dPacky ){
		if( this._object3d.getAppearance() != ctxTick.appearance+"-Packy" ){
			console.log("enemey appearance change from ", this._object3d.getAppearance(), "to", ctxTick.appearance)
			this._object3d.setAppearance( ctxTick.appearance+"-Packy" );
		}
	}else	console.assert(false);


	var object3d	= this._object3d.object3d();
	object3d.position.x	=  ctxTick.position.x;
	object3d.position.z	=  ctxTick.position.y;
	object3d.rotation.y	= -ctxTick.rotation.z;
}

WebyMaze.EnemyCli.prototype.obj3d	= function()
{
	return this._object3d.object3d();
}

WebyMaze.EnemyCli.prototype.object3dDirty	= function(val)
{
	return this._object3d.dirty(val);
}

