var WebyMaze	= WebyMaze || {};

WebyMaze.ShootCli	= function(opts){
	// get parameter from opts
	var position	= opts.position	|| console.assert(false);
	var rotation	= opts.rotation || console.assert(false);
	
	// build this.mesh
	var bodyWidth	= 50;
	var geometry	= new Sphere( bodyWidth/2, 32, 16 );
	var material	= [
		new THREE.MeshLambertMaterial( { color: 0x00aaff, shading: THREE.SmoothShading } ),
		//new THREE.MeshBasicMaterial( { color: 0x884400, shading: THREE.FlatShading, wireframe: true } )
	];
	this.mesh	= new THREE.Mesh(geometry, material);

	this.mesh.position.x	= position.x;
	this.mesh.position.y	= position.y;
	this.mesh.rotation.z	= rotation.z;
}

WebyMaze.ShootCli.prototype.destroy	= function(){
	
}

WebyMaze.ShootCli.prototype.setCtxTick	= function(ctxTick){
	this.mesh.position.x	= ctxTick.position.x;
	this.mesh.position.y	= ctxTick.position.y;
	this.mesh.rotation.z	= ctxTick.rotation.z;
}

WebyMaze.ShootCli.prototype.getObject3d	= function(){
	return this.mesh;
}
