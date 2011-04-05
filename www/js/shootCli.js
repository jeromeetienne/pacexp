var WebyMaze	= WebyMaze || {};

WebyMaze.ShootCli	= function(){
	// build this._container
	var bodyWidth	= 25;
	var geometry = [
		[ new Sphere( bodyWidth/2, 16, 8 )	, 500 ],
		[ new Sphere( bodyWidth/2, 8, 4 )	, 700 ],
		[ new Sphere( bodyWidth/2, 2, 2 )	, 1500 ],
	];
	var material	= [
		new THREE.MeshPhongMaterial( { ambient: 0x0088aa, color: 0xff5500, specular: 0x555555, shininess: 10 } ),

		//new THREE.MeshLambertMaterial( { color: 0x151B8D, shading: THREE.SmoothShading, opacity: 0.9} ),
		//new THREE.MeshBasicMaterial( { color: 0x000000, wireframe: true, opacity: 0.2 } ),
		// FIXME this wire frame is seen on my own player...should not be... displayMe
		//new THREE.MeshBasicMaterial( { color: 0x884400, shading: THREE.FlatShading, wireframe: true } )
	]
	this._container	= new THREE.LOD();
	for(var i = 0; i < geometry.length; i++ ) {
		var mesh = new THREE.Mesh( geometry[i][0], material );
		this._container.add( mesh, geometry[i][1] );
	}	
}

WebyMaze.ShootCli.prototype.destroy	= function(){
	
}

WebyMaze.ShootCli.prototype.setCtxTick	= function(ctxTick){
	this._container.position.x	= ctxTick.position.x;
	this._container.position.z	= ctxTick.position.y;
	this._container.rotation.y	= ctxTick.rotation.z;
}

WebyMaze.ShootCli.prototype.obj3d	= function(){
	return this._container;
}
