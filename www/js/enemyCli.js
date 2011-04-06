var WebyMaze	= WebyMaze || {};

//////////////////////////////////////////////////////////////////////////////////
//		ctor/dtor							//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.EnemyCli	= function(){
}

WebyMaze.EnemyCli.prototype.destroy	= function(){
}

//////////////////////////////////////////////////////////////////////////////////
//		misc								//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.EnemyCli.prototype.setCtxTick	= function(ctxTick){
	this.appearance			= ctxTick.appearance;
	if( !this._container )	this._containerCtor();

	this._container.position.x	= ctxTick.position.x;
	this._container.position.z	= ctxTick.position.y;
	this._container.rotation.y	= ctxTick.rotation.z;
}

WebyMaze.EnemyCli.prototype.obj3d	= function(){
	return this._container;
}

WebyMaze.EnemyCli.prototype._containerCtor	= function(){
	// build this._container
	var bodyW	= 25;

	if( this.appearance == 'happy' ){
		this._containerCtorGhost('happy');
	}else if( this.appearance == 'hurt' ){
		this._containerCtorGhost('hurt');
	}else if( this.appearance == 'eyes' ){
		this._containerCtorEyes('eyes');
	}else console.assert(false, 'unknown appearance '+this.appearance);
}


WebyMaze.EnemyCli.prototype._containerCtorGhost	= function(smileyType){
	if( smileyType === 'happy' ){
		var color	= 0x5500aa;
		//var color	= 0xff5500;
		var ambient	= 0xa0ff00;		
	}else if( smileyType === 'hurt' ){
		var color	= 0x0044aa;
		var ambient	= 0x00a0FF;		
	}

	// create canvas and texture
	this.canvas		= document.createElement('canvas');
	this.canvas.width	= this.canvas.height	= 256;
	this.texture		= new THREE.Texture(this.canvas);
	THREEx.Texture.Smiley[smileyType](this.canvas);
	this.texture.needsUpdate = true;

	// build this._container
	var bodyWidth	= 100;
	var geometry	= new Cylinder( 16, bodyWidth/2, bodyWidth/2, bodyWidth/2, 0, 0 );

// TODO lod	
	var material	= [
		//new THREE.MeshLambertMaterial( { color: color, shading: THREE.flatShading} ),
		new THREE.MeshPhongMaterial( { ambient: ambient, color: color, specular: 0x555555, shininess: 10 } ),
	];
	this._container	= new THREE.Object3D();
	
	var mesh	= new THREE.Mesh( geometry, material );
	mesh.position.y	= +bodyWidth/2 - bodyWidth/4;
	mesh.rotation.x	= 90*Math.PI/180;
	this._container.addChild( mesh );

	var material	= [
		new THREE.MeshPhongMaterial( { ambient: ambient, color: color, specular: 0x555555, shininess: 10 } ),
		//new THREE.MeshLambertMaterial( { color: color, shading: THREE.flatShading} ),
		new THREE.MeshLambertMaterial( { map: this.texture } ),
	];
	
	var geometry	= new Sphere( bodyWidth/2, 32, 16 );
	var mesh	= new THREE.Mesh( geometry, material );
	mesh.position.y	= +bodyWidth/2 - bodyWidth/4;
	this._container.addChild( mesh );	
}


WebyMaze.EnemyCli.prototype._containerCtorEyes	= function()
{
	var bodyW	= 100;
	this._container	= new THREE.Object3D();

	var material	= [
		new THREE.MeshLambertMaterial( { color: 0xffffff, shading: THREE.flatShading} ),
		new THREE.MeshBasicMaterial( { map: THREEx.Texture.Smiley.pupilTexture() } ),
		//new THREE.MeshLambertMaterial( { color: 0xffffff, shading: THREE.flatShading} ),
	];

	var geometry	= new Sphere( bodyW/8, 16, 8 );
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


