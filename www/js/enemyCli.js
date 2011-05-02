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
	}else if( this._config.object3d === 'packy' ){
		this._object3d	= new WebyMaze.Object3dPacky({
			appearance	: "happy-yellow-Packy"
		});		
	}else	console.assert(false);
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
		var ghost2packyAppearance	= function(appearance){
			if( appearance.match(/^eyes-/) )	return "hurt-yellow-Ouch!";
			appearance	= appearance+"-Packy";
			var matches	= appearance.match(/^(.*)-(.*)-(.*)/);
			var textureType	= matches[1];
			var colorStr	= matches[2];
			var nameStr	= matches[3];
			if( colorStr === 'blue' )	return 'hurt-'+colorStr+'-'+'Kay kay';
			if( textureType === 'happy' )	return 'angry-'+colorStr+'-'+'Bad';
			return "angry-blue-Bad";
		}
		if( this._object3d.getAppearance() != ghost2packyAppearance(ctxTick.appearance) ){
			this._object3d.setAppearance( ghost2packyAppearance(ctxTick.appearance) );
		}
	}else	console.assert(false);


	var object3d	= this._object3d.object3d();
	object3d.position.x	=  ctxTick.position.x;
	object3d.position.z	=  ctxTick.position.y;
	object3d.rotation.y	= -ctxTick.rotation.z;
	
	// attempts to make the ghost bounce
	var bodyW	= 100;
	var t		= Date.now() / 1000 * Math.PI;
	object3d.position.y	= Math.sin(t) * bodyW/2.5 - bodyW/2;
}

WebyMaze.EnemyCli.prototype.obj3d	= function()
{
	return this._object3d.object3d();
}

WebyMaze.EnemyCli.prototype.object3dDirty	= function(val)
{
	return this._object3d.dirty(val);
}

