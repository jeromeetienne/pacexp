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
	this.wallW	= 100;

	// determine if renderer is webGl or not
	var isWebGL	= renderer instanceof THREE.WebGLRenderer;

	// build Ground based on renderer capabilities
	//if( isWebGL )	this._buildGroundChessBoard();
	//else		this._buildGroundSingleColor();
	this._buildGroundChessBoard();
	// build Walls
	this._buildWallsSingleColor();
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

	var mazeH	= this.map.length;
	var mazeW	= this.map[0].length;
	for(var mazeY = 0; mazeY < mazeH; mazeY++){
		var mazeLine	= this.map[mazeY];
		for(var mazeX = 0; mazeX < mazeW; mazeX++){
			var mazeXY	= mazeLine.charAt(mazeX);
			if( mazeXY == '*' )	continue;
			
			var mesh = new THREE.Mesh( geometry, material );
			mesh.position.x = ( mazeX - Math.floor(mazeW/2) ) * bodyW;
			mesh.position.y	= -bodyW/2;
			mesh.position.z = ( mazeY - Math.floor(mazeH/2) ) * bodyW;
			mesh.rotation.x	= -90*Math.PI/180;
			
			mesh.matrixAutoUpdate = false;
			mesh.updateMatrix();

			this._container.addChild( mesh );
		}
	}

	this._container.addChild( mesh );
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

WebyMaze.MazeCli.prototype._buildWallsChessBoard	= function(){
	var bodyW	= this.wallW;
	var geometry	= new THREE.Cube( bodyW, bodyW, bodyW );
	// color of the chessBoard
	var colors	= [
		[0xcccccc, 0xffffff],
		[0xaaffaa, 0x88cc88]
	]
	// build material from color
	var materials	= [[],[]];
	colors.forEach(function(colorsY, idxY){
		colorsY.forEach(function(colorX, idxX){
			materials[idxY][idxX]	= [
				new THREE.MeshLambertMaterial( { color: colorX, shading: THREE.FlatShading } ),
				//new THREE.MeshBasicMaterial( { color: 0x000000, wireframe: true } )
			];	
		})
	})

	var mazeH	= this.map.length;
	var mazeW	= this.map[0].length;
	for(var mazeY = 0; mazeY < mazeH; mazeY++){
		var mazeLine	= this.map[mazeY];
		for(var mazeX = 0; mazeX < mazeW; mazeX++){
			var mazeXY	= mazeLine.charAt(mazeX);
			if( mazeXY != '*' )	continue;
		
			var material	= materials[mazeX%2][mazeY%2];
			
			var mesh = new THREE.Mesh( geometry, material );			
			mesh.position.x = ( mazeX - Math.floor(mazeW/2) ) * bodyW;
			mesh.position.y = -bodyW/4;
			mesh.position.z = ( mazeY - Math.floor(mazeH/2) ) * bodyW;
			
			mesh.matrixAutoUpdate = false;
			mesh.updateMatrix();

			this._container.addChild( mesh );
		}
	}
	return this._container;
}

WebyMaze.MazeCli.prototype._buildWallsSingleColor	= function(){
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

	var mazeH	= this.map.length;
	var mazeW	= this.map[0].length;
	for(var mazeY = 0; mazeY < mazeH; mazeY++){
		var mazeLine	= this.map[mazeY];
		for(var mazeX = 0; mazeX < mazeW; mazeX++){
			var mazeXY	= mazeLine.charAt(mazeX);
			if( mazeXY != '*' )	continue;
			
			var mesh = new THREE.Mesh( geometry, material );
			mesh.position.x = ( mazeX - Math.floor(mazeW/2) ) * bodyW;
			mesh.position.y = -bodyW/2 + bodyW/3/2 ;
			mesh.position.z = ( mazeY - Math.floor(mazeH/2) ) * bodyW;
			
			mesh.matrixAutoUpdate = false;
			mesh.updateMatrix();

			this._container.addChild( mesh );
		}
	}
	return this._container;
}

