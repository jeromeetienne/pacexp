var WebyMaze	= WebyMaze || {};

//////////////////////////////////////////////////////////////////////////////////
//		ctor/dtor							//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.EnemyCli	= function()
{
	//this._object3d	= new WebyMaze.Object3dGhost();
	this._object3d	= new WebyMaze.Object3dPacky({
		username	: "guest"
	});
}

WebyMaze.EnemyCli.prototype.destroy	= function(){
}

//////////////////////////////////////////////////////////////////////////////////
//		misc								//
//////////////////////////////////////////////////////////////////////////////////


WebyMaze.EnemyCli.prototype.setCtxTick	= function(ctxTick)
{
	//if( this._object3d.getAppearance() != ctxTick.appearance ){
	//	console.log("enemey appearance change from ", this.appearance, "to", ctxTick.appearance)
	//	this._object3d.setAppearance( ctxTick.appearance );
	//}

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

