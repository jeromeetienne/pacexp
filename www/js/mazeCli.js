
var WebyMaze	= WebyMaze || {};

WebyMaze.MazeCli	= function(opts){
	this.map	= opts.map	|| console.assert(false);
}

WebyMaze.MazeCli.prototype.getMap	= function(){
	return this.map;
}

WebyMaze.MazeCli.prototype.buildObject3d	= function(){
	var cubeW	= 100;

	var geometry	= new Cube( cubeW, cubeW, cubeW );
	//var geometry = new Sphere( cubeW/2, 64, 32 );
	var material	= new THREE.MeshNormalMaterial();
	material	= new THREE.MeshLambertMaterial( { color: 0xdddddd, shading: THREE.SmoothShading } )
	material	= [
		new THREE.MeshLambertMaterial( { color: 0xffaa00, shading: THREE.SmoothShading } ),
		new THREE.MeshBasicMaterial( { color: 0x000000, wireframe: true } )
	];

	this.group 	= new THREE.Object3D();
	var map		= this.map;
	var MazeCliH	= map.length;
	var MazeCliW	= map[0].length;
	for(var y = 0; y < MazeCliH; y++){
		var MazeCliLine	= map[y];
		for(var x = 0; x < MazeCliW; x++){
			var MazeCliXY	= MazeCliLine.charAt(x);
			if( MazeCliXY != '*' )	continue;
			
			var mesh = new THREE.Mesh( geometry, material );			
			mesh.position.x = x * cubeW - MazeCliW*cubeW/2;
			mesh.position.y = y * cubeW - MazeCliH*cubeW/2;
			
			//mesh.matrixAutoUpdate = false;
			//mesh.updateMatrix();

			this.group.addChild( mesh );
		}
	}
	return this.group;
}
