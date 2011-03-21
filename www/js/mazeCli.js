
var WebyMaze	= WebyMaze || {};

WebyMaze.MazeCli	= function(opts){
	this.map	= opts.map	|| console.assert(false);
	this._container	= new THREE.Object3D();
	this.wallW	= 100;
	
	this._buildWalls();
	this._buildGround();
}

WebyMaze.MazeCli.prototype.getMap	= function(){
	return this.map;
}

WebyMaze.MazeCli.prototype._buildGround	= function(){
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

WebyMaze.MazeCli.prototype._buildWalls	= function(){
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
