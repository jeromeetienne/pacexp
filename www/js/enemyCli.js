var WebyMaze	= WebyMaze || {};

//////////////////////////////////////////////////////////////////////////////////
//		ctor/dtor							//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.EnemyCli	= function()
{
	// read the game config
	this._config	= WebyMaze.ConfigCli.enemyCli;


	if( this._config.object3d === 'ghost' ){
		this._object3d	= new WebyMaze.Object3dGhost();
	}else if( this._config.object3d === 'pucky' ){
		this._object3d	= new WebyMaze.Object3dPucky({
			appearance	: "happy-yellow-Pucky"
		});		
	}else	console.assert(false);
}

WebyMaze.EnemyCli.prototype.destroy	= function(){
}


// mixin MicroEvent 
MicroEvent.mixin(WebyMaze.EnemyCli);


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
	}else if( this._object3d instanceof WebyMaze.Object3dPucky ){
		var ghost2puckyAppearance	= function(appearance){
			if( appearance.match(/^eyes-/) )	return "hurt-yellow-Ouch!";
			appearance	= appearance+"-Pucky";
			var matches	= appearance.match(/^(.*)-(.*)-(.*)/);
			var textureType	= matches[1];
			var colorStr	= matches[2];
			var nameStr	= matches[3];
			if( colorStr === 'blue' )	return 'hurt-'+colorStr+'-'+'Kay kay';
			if( textureType === 'happy' )	return 'angry-'+colorStr+'-'+'Bad';
			return "angry-blue-Bad";
		}
		if( this._object3d.getAppearance() != ghost2puckyAppearance(ctxTick.appearance) ){
			this._object3d.setAppearance( ghost2puckyAppearance(ctxTick.appearance) );
		}
	}else	console.assert(false);


	var object3d	= this._object3d.object3d();
	object3d.position.x	=  ctxTick.position.x;
	object3d.position.z	=  ctxTick.position.y;
	object3d.rotation.y	= -ctxTick.rotation.z;
	
	// attempts to make the ghost bounce
	if( false ){
		var bodyW	= 100;
		var t		= Date.now() / 1000 * Math.PI;
		object3d.position.y	= Math.sin(t) * bodyW/2.5 - bodyW/2;
	}
	
	// honor postTick event
	this.trigger('postTick');
}

WebyMaze.EnemyCli.prototype.obj3d	= function()
{
	return this._object3d.object3d();
}

WebyMaze.EnemyCli.prototype.object3dDirty	= function(val)
{
	return this._object3d.dirty(val);
}

