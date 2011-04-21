var WebyMaze	= WebyMaze || {};

WebyMaze.ShootCli	= function(){
	// build this._container
	var bodyW	= 25;
	
	

	// determine if renderer is webGl or not
	var isWebGL	= renderer instanceof THREE.WebGLRenderer;
	if( isWebGL ){
		var geometry = [
			[ new THREE.Sphere( bodyW/2, 16, 8 )	, 500 ],
			[ new THREE.Sphere( bodyW/2, 8, 4 )	, 700 ],
			[ new THREE.Sphere( bodyW/2, 2, 2 )	, 1500 ],
		];
		var material	= [
			
			new THREE.MeshPhongMaterial( { ambient: 0x0088aa, color: 0xff5500, specular: 0x555555, shininess: 10 } ),
	
			//new THREE.MeshLambertMaterial( { color: 0x151B8D, shading: THREE.SmoothShading, opacity: 0.9} ),
			//new THREE.MeshBasicMaterial( { color: 0x000000, wireframe: true, opacity: 0.2 } ),
			// FIXME this wire frame is seen on my own player...should not be... displayMe
			//new THREE.MeshBasicMaterial( { color: 0x884400, shading: THREE.FlatShading, wireframe: true } )
		]
	}else{
		var geometry	= [
			[ new THREE.Cube( bodyW, bodyW, bodyW, 1, 1, 1, [], 0, { px: true, nx: true, py: true, ny: false, pz: true, nz: true } ), 99999 ]
		];
		var material	= new THREE.MeshLambertMaterial( { color: 0xaa88aa, shading: THREE.FlatShading } );
	}
	
	this._container	= new THREE.LOD();
	for(var i = 0; i < geometry.length; i++ ) {
		var mesh = new THREE.Mesh( geometry[i][0], material );
		this._container.add( mesh, geometry[i][1] );
	}
}

WebyMaze.ShootCli.prototype.destroy	= function(){
	
}

WebyMaze.ShootCli.prototype.setCtxTick	= function(ctxTick)
{
	this._container.position.x	= ctxTick.position.x;
	this._container.position.z	= ctxTick.position.y;
	this._container.rotation.y	= ctxTick.rotation.z;

	//this._light.position.x	= ctxTick.position.x;
	//this._light.position.z	= 300;
	//this._light.rotation.y	= ctxTick.rotation.z;
}

WebyMaze.ShootCli.prototype.obj3d	= function(){
	return this._container;
}
