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
	if( !this._container )	this._containerCtor();
	//if( !this._container )	this._containerSpriteCtor();

	this._container.position.x	= ctxTick.position.x;
	this._container.position.z	= ctxTick.position.y;
	this._container.rotation.y	= ctxTick.rotation.z;
}

WebyMaze.PillCli.prototype.obj3d	= function(){
	return this._container;
}

WebyMaze.PillCli.prototype._containerSpriteCtor	= function()
{
	var mesh	= new THREE.Sprite({
		map			: THREE.ImageUtils.loadTexture('images/tmp/sprite0.png'),
		useScreenCoordinates	: false
	});

	if( this.pillType == 'white' ){
		mesh.scale.set( 0.4, 0.4, 1.0 );
	}else if( this.pillType == 'red' ){
		mesh.scale.set( 0.6, 0.6, 1.0 );
	}else {
		console.assert(false);
	}

	this._container	= new THREE.Object3D();
	this._container.addChild(mesh)
}
WebyMaze.PillCli.prototype._containerCtor	= function(){
	// build this._container
	var bodyW	= 25;
	var geometry = [
		[ new THREE.Sphere( bodyW/2, 8, 4 )	, 500 ],
		[ new THREE.Sphere( bodyW/2, 4, 2 )	, 700 ],
		[ new THREE.Sphere( bodyW/2, 2, 2 )	, 1500 ],
	];

	// determine the material based on this.pillType	
	var material	= null;
	if( this.pillType == 'white' ){
		material	= [
			new THREE.MeshLambertMaterial( { color: 0xFFFFFF, shading: THREE.SmoothShading} ),
		];
	}else if( this.pillType == 'red' ){
		this.canvas	= document.createElement('canvas');
		this.canvas.width	= this.canvas.height	= 256;
		this.texture	= new THREE.Texture(this.canvas);
		// load the image
		var img		= new Image();
		img.onload	= function(){
			console.log("image loaded")
			var ctx		= this.canvas.getContext( '2d' );
			ctx.save();
			ctx.translate(0, 0);
			ctx.drawImage(img, 0,0, 256,256)
			ctx.restore();
			
			// mark this texture as "needsUpdate"
			this.texture.needsUpdate = true;
		}.bind(this);
		img.src		= "images/textures/MarbleBeige0028_5_thumbhuge.jpg";	
		//img.src		= "images/textures/MarbleGreen0001_39_thumbhuge.jpg";	

		
		material	= [
			//new THREE.MeshLambertMaterial( { color: 0xE3319D, shading: THREE.SmoothShading, opacity: 0.9} ),
			new THREE.MeshLambertMaterial( { map: this.texture } )
		];
	}else console.assert(false, 'unknown pillType '+this.pillType);

	// build the object	
	this._container	= new THREE.LOD();
	for(var i = 0; i < geometry.length; i++ ) {
		var mesh = new THREE.Mesh( geometry[i][0], material );
		this._container.add( mesh, geometry[i][1] );
	}
}

