/** @namespace */
var WebyMaze	= WebyMaze || {};


//////////////////////////////////////////////////////////////////////////////////
//		ctor/dtor							//
//////////////////////////////////////////////////////////////////////////////////

/**
 * Handle the map where the player lives
 * - TODO rename this as map
*/
WebyMaze.MazeCli	= function(opts){
	this.map	= opts.map	|| console.assert(false);
	this._container	= new THREE.Object3D();
	
	this.tileW	= 100;
	this.tileH	= 100;

	/** @deprecated */
	this.wallW	= this.tileW;

	// determine if renderer is webGl or not
	var isWebGL	= renderer instanceof THREE.WebGLRenderer;

	// build Ground based on renderer capabilities
	//if( isWebGL )	this._buildGroundChessBoard();
	//else		this._buildGroundSingleColor();
	this._buildGroundChessBoard();
	// build Walls
	this._buildWalls();
}

WebyMaze.MazeCli.prototype.destroy	= function()
{
}

//////////////////////////////////////////////////////////////////////////////////
//		Misc								//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.MazeCli.prototype.getMap	= function(){
	return this.map;
}

WebyMaze.MazeCli.prototype.obj3d	= function(){
	return this._container;
}

WebyMaze.MazeCli.prototype.mapW	= function()
{
	return this.map[0].length;
}

WebyMaze.MazeCli.prototype.mapH	= function()
{
	return this.map.length
}

WebyMaze.MazeCli.prototype.mapChar	= function(x, y)
{
	console.assert(x >= 0);
	console.assert(x < this.mapW());
	console.assert(y >= 0);
	console.assert(y < this.mapH());

	var mazeLine	= this.map[y];
	var mapChar	= mazeLine.charAt(x);
	return mapChar;
}

WebyMaze.MazeCli.prototype.mapForEach	= function(callback)
{
	var mazeH	= this.mapH();
	var mazeW	= this.mapW();
	for(var mazeY = 0; mazeY < mazeH; mazeY++){
		for(var mazeX = 0; mazeX < mazeW; mazeX++){
			var mapChar	= this.mapChar(mazeX, mazeY);
			callback(mazeX, mazeY, mapChar);
		}
	}
}

WebyMaze.MazeCli.prototype.map2spaceX	= function(mapX)
{
	return ( mapX - Math.floor(this.mapW()/2) ) * this.tileW;
}

WebyMaze.MazeCli.prototype.map2spaceY	= function(mapY)
{
	return ( mapY - Math.floor(this.mapH()/2) ) * this.tileH;
}


WebyMaze.MazeCli.prototype.space2mapX	= function(spaceX)
{
	return	Math.floor(spaceX / this.tileW) + Math.floor(this.mapW()/2)
}

WebyMaze.MazeCli.prototype.space2mapY	= function(spaceY)
{
	return	Math.floor(spaceY / this.tileH) + Math.floor(this.mapH()/2)
}

//////////////////////////////////////////////////////////////////////////////////
//		Ground Building							//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.MazeCli.prototype._buildGroundChessBoard	= function()
{
	var bodyW	= this.wallW;
	var geometry	= new THREE.Plane(bodyW, bodyW, 1, 1);
	// determine if renderer is webGl or not
	var isWebGL	= renderer instanceof THREE.WebGLRenderer;

	// build material from color
	if( isWebGL ){
		var material	= [
			new THREE.MeshBasicMaterial( { color: 0xffffff, map: THREE.ImageUtils.loadTexture('images/tmp/PaddedOrangeWall.png') } )
		];
	}else{
		var material	= [
			new THREE.MeshLambertMaterial( {color: 0x228B22, shading: THREE.FlatShading} ),
		];
	}

	this.mapForEach(function(mapX, mapY, mapChar){
		if( mapChar == '*' )	return;
		
		var mesh = new THREE.Mesh( geometry, material );
		mesh.position.x = this.map2spaceX(mapX);
		mesh.position.y	= -bodyW/2;
		mesh.position.z = this.map2spaceY(mapY);
		mesh.rotation.x	= -90*Math.PI/180;
		
		mesh.matrixAutoUpdate = false;
		mesh.updateMatrix();

		this._container.addChild( mesh );
	}.bind(this))
}

WebyMaze.MazeCli.prototype._buildGroundSingleColor	= function(){
	var bodyW	= this.wallW;
	var mazeH	= this.map.length;
	var mazeW	= this.map[0].length;

	var geometry	= new THREE.Plane(mazeW*bodyW, mazeH*bodyW, mazeW, mazeH);


	// determine if renderer is webGl or not
	var isWebGL	= renderer instanceof THREE.WebGLRenderer;
	// set the material depending on renderer capabilities
	if( isWebGL ){
		var material	= [
			//new THREE.MeshBasicMaterial( { color: 0xffffff, map: THREE.ImageUtils.loadTexture('images/tmp/PaddedOrangeWall.png') } )
			//new THREE.MeshBasicMaterial( {color: 0x4CC417} ),
			//new THREE.MeshBasicMaterial( { color: 0xffffff, map: THREE.ImageUtils.loadTexture('images/textures/MarbleGreen0001_39_thumbhuge.jpg') } )
			//new THREE.MeshNormalMaterial( ),
			//new THREE.MeshBasicMaterial( { color: 0x000000, wireframe: true } )
			new THREE.MeshPhongMaterial( { ambient: 0x0088aa, color: 0xff5500, specular: 0x555555, shininess: 10 } ),
	
			//new THREE.MeshLambertMaterial( { map: ImageUtils.loadTexture('images/textures/TilesOrnate0082_2_thumbhuge.jpg'), opacity: 0.8 } ),
			//new THREE.MeshPhongMaterial( { ambient: 0x0088aa, color: 0xff5500, specular: 0x555555, shininess: 10 } ),		
		];
	}else{
		var material	= [
			//new THREE.MeshBasicMaterial( {color: 0x4CC417} ),
			//new THREE.MeshBasicMaterial( { color: 0xffffff, map: THREE.ImageUtils.loadTexture('images/textures/MarbleGreen0001_39_thumbhuge.jpg') } )
			new THREE.MeshNormalMaterial( ),
			new THREE.MeshBasicMaterial( { color: 0x000000, wireframe: true } )
			//new THREE.MeshLambertMaterial( { map: ImageUtils.loadTexture('images/textures/TilesOrnate0082_2_thumbhuge.jpg'), opacity: 0.8 } ),
			//new THREE.MeshPhongMaterial( { ambient: 0x0088aa, color: 0xff5500, specular: 0x555555, shininess: 10 } ),		
		];
	}
	

	var mesh = new THREE.Mesh( geometry, material );
	mesh.position.x = -((mazeW+1)%2)* bodyW/2;
	mesh.position.y	= -bodyW/2;
	mesh.position.z = -((mazeH+1)%2)* bodyW/2;
	mesh.rotation.x	= -90*Math.PI/180;
	
	mesh.matrixAutoUpdate = false;
	mesh.updateMatrix();

	this._container.addChild( mesh );
}

//////////////////////////////////////////////////////////////////////////////////
//		Walls								//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.MazeCli.prototype._buildWalls	= function()
{
	var bodyW	= this.wallW;
	//var geometry	= new THREE.Cube( bodyW, bodyW/3, bodyW );
	var geometry	= new THREE.Cube( bodyW, bodyW/3, bodyW, 1, 1, 1, [], 0, { px: true, nx: true, py: true, ny: false, pz: true, nz: true } );

	// determine if renderer is webGl or not
	var isWebGL	= renderer instanceof THREE.WebGLRenderer;
	// set the material depending on renderer capabilities
	if( isWebGL ){
		var material	= [
			new THREE.MeshPhongMaterial( { ambient: 0xcccccc, color: 0x553300, specular: 0x555555, shininess: 10
							, map: THREE.ImageUtils.loadTexture('images/tmp/BluePaintedTiles.png') } ),
		];
	}else{
		var material	= [
			new THREE.MeshLambertMaterial( { color: 0x0088aa, shading: THREE.FlatShading } ),
			//new THREE.MeshLambertMaterial( { color: 0xffaa00, shading: THREE.SmoothShading } ),
			//new THREE.MeshBasicMaterial( { color: 0x000000, wireframe: true } )
		];		
	}

	this.mapForEach(function(mapX, mapY, mapChar){
		if( mapChar != '*' )	return;
		
		var mesh = new THREE.Mesh( geometry, material );
		mesh.position.x = this.map2spaceX(mapX);
		mesh.position.y = -bodyW/2 + bodyW/3/2 ;
		mesh.position.z = this.map2spaceY(mapY);
		
		mesh.matrixAutoUpdate = false;
		mesh.updateMatrix();

		this._container.addChild( mesh );
	}.bind(this));

	return this._container;
}

