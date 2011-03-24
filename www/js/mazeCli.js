
var WebyMaze	= WebyMaze || {};


/**
 * Handle the map where the player lives
 * - TODO rename this as map
*/
WebyMaze.MazeCli	= function(opts){
	this.map	= opts.map	|| console.assert(false);
	this._container	= new THREE.Object3D();
	this.wallW	= 100;
	
	this._buildWallsSingleColor();
	this._buildGroundChessBoard();
}

WebyMaze.MazeCli.prototype.getMap	= function(){
	return this.map;
}

//////////////////////////////////////////////////////////////////////////////////
//		How to build Grounds						//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.MazeCli.prototype._buildGroundChessBoard	= function(){
	var bodyW	= this.wallW;
	var geometry	= new Plane(bodyW, bodyW, 1, 1);
	//var material	= [
	//	new THREE.MeshBasicMaterial( {color: 0x4CC417} ),
	//	//new THREE.MeshNormalMaterial( ),
	//	new THREE.MeshBasicMaterial( { color: 0x000000, wireframe: true } )
	//];
	// color of the chessBoard
	var colors	= [
		[0x88cc88, 0x66bb66],
		[0x66bb66, 0x88cc88]
	]
	// build material from color
	var materials	= [[],[]];
	colors.forEach(function(colorsY, idxY){
		colorsY.forEach(function(colorX, idxX){
			materials[idxY][idxX]	= [
				//new THREE.MeshLambertMaterial( { color: colorX, shading: THREE.FlatShading } ),
				new THREE.MeshBasicMaterial( { color: colorX } )
			];			
		})
	})

	var mazeH	= this.map.length;
	var mazeW	= this.map[0].length;
	for(var mazeY = 0; mazeY < mazeH; mazeY++){
		var mazeLine	= this.map[mazeY];
		for(var mazeX = 0; mazeX < mazeW; mazeX++){
			var material	= materials[mazeX%2][mazeY%2];
			
			var mesh = new THREE.Mesh( geometry, material );			
			mesh.position.x = mazeX * bodyW + bodyW/2 - mazeW*bodyW/2;
			mesh.position.z = mazeY * bodyW + bodyW/2 - mazeH*bodyW/2;
			mesh.position.y	= -bodyW/2;
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

	var geometry	= new Plane(mazeW*bodyW, mazeH*bodyW, mazeW, mazeH);
	var material	= [
		new THREE.MeshBasicMaterial( {color: 0x4CC417} ),
		//new THREE.MeshNormalMaterial( ),
		new THREE.MeshBasicMaterial( { color: 0x000000, wireframe: true } )
	];

	var mesh = new THREE.Mesh( geometry, material );
	mesh.position.y	= -bodyW/2;
	mesh.rotation.x	= -90*Math.PI/180;
	
	mesh.matrixAutoUpdate = false;
	mesh.updateMatrix();

	this._container.addChild( mesh );
}

//////////////////////////////////////////////////////////////////////////////////
//		How to build Walls						//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.MazeCli.prototype._buildWallsChessBoard	= function(){
	var bodyW	= this.wallW;
	var geometry	= new Cube( bodyW, bodyW, bodyW );
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
				new THREE.MeshBasicMaterial( { color: 0x000000, wireframe: true } )
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
			mesh.position.x = mazeX * bodyW + bodyW/2 - mazeW*bodyW/2;
			mesh.position.z = mazeY * bodyW + bodyW/2 - mazeH*bodyW/2;
			
			mesh.matrixAutoUpdate = false;
			mesh.updateMatrix();

			this._container.addChild( mesh );
		}
	}
	return this._container;
}

WebyMaze.MazeCli.prototype._buildWallsSingleColor	= function(){
	var bodyW	= this.wallW;
	var geometry	= new Cube( bodyW, bodyW, bodyW );
	var material	= [
		//new THREE.MeshLambertMaterial( { color: 0xffaa00, shading: THREE.SmoothShading } ),
		new THREE.MeshLambertMaterial( { color: 0xaaaaaa, shading: THREE.FlatShading } ),
		//new THREE.MeshNormalMaterial( ),
		new THREE.MeshBasicMaterial( { color: 0x000000, wireframe: true } )
	];

	var mazeH	= this.map.length;
	var mazeW	= this.map[0].length;
	for(var mazeY = 0; mazeY < mazeH; mazeY++){
		var mazeLine	= this.map[mazeY];
		for(var mazeX = 0; mazeX < mazeW; mazeX++){
			var mazeXY	= mazeLine.charAt(mazeX);
			if( mazeXY != '*' )	continue;
			
			var mesh = new THREE.Mesh( geometry, material );			
			mesh.position.x = mazeX * bodyW + bodyW/2 - mazeW*bodyW/2;
			mesh.position.z = mazeY * bodyW + bodyW/2 - mazeH*bodyW/2;
			
			mesh.matrixAutoUpdate = false;
			mesh.updateMatrix();

			this._container.addChild( mesh );
		}
	}
	return this._container;
}

WebyMaze.MazeCli.prototype.obj3d	= function(){
	return this._container;
}
