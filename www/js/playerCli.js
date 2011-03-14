var WebyMaze	= WebyMaze || {};

WebyMaze.PlayerCli	= function(opts){
}

WebyMaze.PlayerCli.prototype.buildObject3d	= function(){
	var cubeW	= 100;
	var geometry	= new Sphere( cubeW/2, 32, 16 );
	//var material	= new THREE.MeshBasicMaterial({ color: 0xffaa00});
	//material= new THREE.MeshLambertMaterial( { color: 0xffffff, shading: THREE.FlatShading, vertexColors: true } );
	//material= new THREE.MeshBasicMaterial( { color: 0x000000, shading: THREE.FlatShading, wireframe: true } )
	//material	= new THREE.MeshLambertMaterial( { color: 0xffaa00, shading: THREE.SmoothShading } )
	var material	= [
		new THREE.MeshLambertMaterial( { color: 0xffaa00, shading: THREE.SmoothShading } ),
		new THREE.MeshBasicMaterial( { color: 0x884400, shading: THREE.FlatShading, wireframe: true } )
	];
	this.mesh	= new THREE.Mesh(geometry, material);
	this.mesh.position.x	= 0;
	this.mesh.position.y	= 0;
	this.mesh.position.z	= 0;
	return this.mesh;
}
