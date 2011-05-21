var WebyMaze	= WebyMaze || {};

//////////////////////////////////////////////////////////////////////////////////
//		ctor/dtor							//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.PillCli	= function(){
}

WebyMaze.PillCli.prototype.destroy	= function(){
}

//////////////////////////////////////////////////////////////////////////////////
//		misc								//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.PillCli.prototype.setCtxTick	= function(ctxTick){
	this.pillType			= ctxTick.pillType;
	//if( !this._container )	this._containerCtor();
	if( !this._container ){
		if( this.pillType == 'white' ){		this._containerSpriteCtor();
		}else if( this.pillType == 'red' ){	this._containerCtor();
		}else	console.assert(false, "invalid pillType "+this.pillType);
	}

	this._container.position.x	= ctxTick.position.x;
	this._container.position.z	= ctxTick.position.y;
	this._container.rotation.y	= ctxTick.rotation.z;
}

WebyMaze.PillCli.prototype.obj3d	= function(){
	return this._container;
}

WebyMaze.PillCli.prototype._containerSpriteCtor	= function()
{

	if( this.pillType == 'white' ){
		var mesh	= new THREE.Sprite({
			//map			: THREE.ImageUtils.loadTexture('images/tmp/sprite0.png'),
			map			: THREE.ImageUtils.loadTexture('images/lensFlare/Flare2.png'),
			blending		: THREE.AdditiveBlending,
			useScreenCoordinates	: false
		});
		mesh.scale.set( 0.4, 0.4, 1.0 );
	}else if( this.pillType == 'red' ){
		var mesh	= new THREE.Sprite({
			//map			: THREE.ImageUtils.loadTexture('images/tmp/sprite0.png'),
			map			: THREE.ImageUtils.loadTexture('images/lensFlare/Flare1.png'),
			blending		: THREE.AdditiveBlending,
			useScreenCoordinates	: false
		});
		mesh.scale.set( 0.6, 0.6, 1.0 );
	}else {
		console.assert(false);
	}

	this._container	= new THREE.Object3D();
	mesh.position.y	= -25/2;
	this._container.addChild(mesh)
}

WebyMaze.PillCli.prototype._containerCtor	= function(){
	// build this._container
	var bodyW	= 25;
	var detailMult	= 1;
	if( this.pillType == 'white' ){
		detailMult	= 1;
		bodyW		= 25;
	}else{
		detailMult	= 4;
		bodyW		= 50;
	}


	// determine if renderer is webGl or not
	var isWebGL	= renderer instanceof THREE.WebGLRenderer;
	if( isWebGL ){
		var geometry = [
			[ new THREE.Sphere( bodyW/2, 8*detailMult, 4*detailMult )	, 500 ],
			[ new THREE.Sphere( bodyW/2, 4*detailMult, 2*detailMult )	, 700 ],
			[ new THREE.Sphere( bodyW/2, 3*detailMult, 2*detailMult )	, 1500 ],
		];
		// determine the material based on this.pillType	
		var material	= null;
		if( this.pillType == 'white' ){
			material	= new THREE.MeshLambertMaterial( { color: 0xFFFFFF, shading: THREE.SmoothShading} )
		}else if( this.pillType == 'red' ){
			material	= new THREE.MeshPhongMaterial( { ambient: 0xFF0000, color: 0x00FF00, specular: 0x555555, shininess: 10 } );
		}else console.assert(false, 'unknown pillType '+this.pillType);
	}else{
		var geometry	= [
			[ new THREE.Cube( bodyW/3, bodyW/3, bodyW/3, 1, 1, 1, [], 0, { px: true, nx: true, py: true, ny: false, pz: true, nz: true } ), 99999 ]
		];
		// determine the material based on this.pillType	
		var material	= null;
		if( this.pillType == 'white' ){
			material	= new THREE.MeshLambertMaterial( { color: 0xFFFFFF, shading: THREE.FlatShading } );
		}else if( this.pillType == 'red' ){
			material	= new THREE.MeshLambertMaterial( { color: 0xFF0000, shading: THREE.FlatShading } );
		}else console.assert(false, 'unknown pillType '+this.pillType);
	}
	


	// build the object	
	this._container	= new THREE.LOD();
	for(var i = 0; i < geometry.length; i++ ) {
		var mesh = new THREE.Mesh( geometry[i][0], material );
		this._container.add( mesh, geometry[i][1] );
	}
}

