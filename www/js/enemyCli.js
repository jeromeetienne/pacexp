var WebyMaze	= WebyMaze || {};

//////////////////////////////////////////////////////////////////////////////////
//		ctor/dtor							//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.EnemyCli	= function()
{
}

WebyMaze.EnemyCli.prototype.destroy	= function(){
}

//////////////////////////////////////////////////////////////////////////////////
//		misc								//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.EnemyCli.prototype.textureType	= function()
{
	return this.appearance.match(/^(.*)-(.*)/)[1];
}

WebyMaze.EnemyCli.prototype.colorStr	= function()
{
	return this.appearance.match(/^(.*)-(.*)/)[2];
}


WebyMaze.EnemyCli.prototype.obj3d	= function(){
	return this._container;
}

//////////////////////////////////////////////////////////////////////////////////
//		misc								//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.EnemyCli.prototype.setCtxTick	= function(ctxTick){
	if( this.appearance != ctxTick.appearance ){
		console.log("enemey appearance change from ", this.appearance, "to", ctxTick.appearance)
		this.appearance		= ctxTick.appearance;

		if( this._container ){
			console.log("remove the previous _container")
			scene.removeObject(this._container)
		}
		this._containerCtor();
	}

	this._container.position.x	= ctxTick.position.x;
	this._container.position.z	= ctxTick.position.y;
	this._container.rotation.y	= -ctxTick.rotation.z;
}

WebyMaze.EnemyCli.prototype._containerCtor	= function()
{
	var textureType	= this.textureType();

	if( textureType == 'happy' ){
		this._containerCtorGhost();
	}else if( textureType == 'hurt' ){
		this._containerCtorGhost();
	}else if( textureType == 'eyes' ){
		this._containerCtorEyes();
	}else console.assert(false, 'unknown appearance '+this.appearance);

	this._dirtyObj3d	= true;
}

WebyMaze.EnemyCli.prototype._containerCtorGhost	= function()
{
	var textureType	= this.textureType();
	var colorStr	= this.colorStr();
	if( colorStr === 'red' ){
		var textOnBack	= "Blinky";
		var color	= 0x5500aa;
		var ambient	= 0xDC143C;		
	}else if( colorStr === 'pink' ){
		var textOnBack	= "Pinky";
		var color	= 0x5500aa;
		var ambient	= 0xff8080;		
	}else if( colorStr === 'orange' ){
		var textOnBack	= "Clyde";
		var color	= 0x5500aa;
		var ambient	= 0xFF4500;		
	}else if( colorStr === 'lightblue' ){
		var textOnBack	= "Inky";
		var color	= 0x5500aa;
		var ambient	= 0x3DC5CC;
	}else if( colorStr === 'blue' ){
		var color	= 0x0044aa;
		var ambient	= 0x00a0FF;
	}else	console.assert(false);

	// create canvas and texture
	this.canvas		= document.createElement('canvas');
	this.canvas.width	= this.canvas.height	= 256;
	this.texture		= new THREE.Texture(this.canvas);
	THREEx.Texture.Smiley[textureType](this.canvas);
	if( textOnBack )	THREEx.Texture.Smiley.textOnBack(this.canvas, textOnBack );
	this.texture.needsUpdate = true;

	// build this._container
	var bodyW	= 100;

// TODO lod	
	this._container	= new THREE.Object3D();

	// determine if renderer is webGl or not
	var isWebGL	= renderer instanceof THREE.WebGLRenderer;


	// add the Head
	if( isWebGL ){
		var geometry	= new THREE.Sphere( bodyW/2, 32, 16 );
		var material	= [
			new THREE.MeshPhongMaterial( { ambient: ambient, color: color, specular: 0x555555, shininess: 10 } ),
			new THREE.MeshBasicMaterial( { map: this.texture } ),
			//new THREE.MeshLambertMaterial( { color: color, shading: THREE.FlatShading} ),
		];
	}else{
		//var geometry	= new THREE.Sphere( bodyW/2, 16, 8 );		
		var geometry	= new THREE.Cube( bodyW/4, bodyW*0.8, bodyW/2 );
		var material	= [
			//new THREE.MeshLambertMaterial( { color: 0x0088aa, shading: THREE.FlatShading } ),
			//new THREE.MeshLambertMaterial( { color: 0x999900, shading: THREE.FlatShading } ),
			new THREE.MeshLambertMaterial( { color: ambient, shading: THREE.FlatShading} ),
		];
	}
	var mesh	= new THREE.Mesh( geometry, material );
	mesh.position.y	= +bodyW/2 - bodyW/4;
	this._container.addChild( mesh );
	

	// add the Robe
	if( isWebGL ){
		var geometry	= new THREE.Cylinder( 16, bodyW/2, bodyW/2, bodyW/2, 0, 0 );
		var material	= [
			//new THREE.MeshLambertMaterial( { color: color, shading: THREE.FlatShading} ),
			new THREE.MeshPhongMaterial( { ambient: ambient, color: color, specular: 0x555555, shininess: 10 } ),
		];
		var mesh	= new THREE.Mesh( geometry, material );
		mesh.position.y	= 0;
		mesh.rotation.x	= 90*Math.PI/180;
		this._container.addChild( mesh );
	}	

	// add the shaddow
	if( isWebGL ){
		var mesh		= new THREE.Mesh(
			new THREE.Plane( bodyW, bodyW ),
			new THREE.MeshLambertMaterial( { map: THREEx.Texture.Smiley.shaddowTexture(), opacity: 0.5 } )
		);
		mesh.position.y	= -bodyW/2 + 1;
		mesh.rotation.x	= - 90 * ( Math.PI / 180 );
		mesh.overdraw	= true;
		this._container.addChild( mesh );		
	}
}

WebyMaze.EnemyCli.prototype._containerCtorEyes	= function()
{
	var bodyW	= 100;
	this._container	= new THREE.Object3D();

	var material	= [
		new THREE.MeshLambertMaterial( { color: 0xffffff, shading: THREE.FlatShading} ),
		new THREE.MeshBasicMaterial( { map: THREEx.Texture.Smiley.pupilTexture() } ),
		//new THREE.MeshLambertMaterial( { color: 0xffffff, shading: THREE.FlatShading} ),
	];

	var geometry	= new THREE.Sphere( bodyW/8, 16, 8 );
	var mesh	= new THREE.Mesh( geometry, material );
	mesh.position.x	=   bodyW / 4;
	mesh.position.y	=   bodyW / 4;
	mesh.position.z	= + bodyW / 4;	
	this._container.addChild( mesh );	

	var mesh	= new THREE.Mesh( geometry, material );
	mesh.position.x	=   bodyW / 4;
	mesh.position.y	=   bodyW / 4;
	mesh.position.z	= - bodyW / 4;	
	this._container.addChild( mesh );
}


