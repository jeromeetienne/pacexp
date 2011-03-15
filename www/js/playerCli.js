var WebyMaze	= WebyMaze || {};

/**
 * NOTE: experimental generated texture
 * TODO: to remove
*/
function generateTexture() {
	var canvas	= document.createElement( 'canvas' );
	canvas.width	= 256;
	canvas.height	= 256;
	var context	= canvas.getContext( '2d' );
	var image	= context.getImageData(0, 0, 256, 256);
	var x = 0, y = 0;
	for ( var i = 0, j = 0, l = image.data.length; i < l; i += 4, j ++ ) {
		x = j % 256;
		y = x == 0 ? y + 1 : y;
		image.data[ i + 1 ] = Math.floor( x ^ y );
		image.data[ i + 2 ] = Math.floor( x ^ y );
		image.data[ i + 3 ] = 255;
	}
	context.putImageData( image, 0, 0 );
	return canvas;
}

var generatedTexture = new THREE.Texture( generateTexture() );
generatedTexture.needsUpdate = true;


WebyMaze.PlayerCli	= function(opts){
	// get parameter from opts
	var position	= opts.position	|| console.assert(false);
	var rotation	= opts.rotation || console.assert(false);
	
	// build this.mesh
	var cubeW	= 100;
	var geometry	= new Sphere( cubeW/2, 32, 16 );
	var material	= [
		new THREE.MeshLambertMaterial( { color: 0xffaa00, shading: THREE.SmoothShading } ),
		new THREE.MeshBasicMaterial( { color: 0x884400, shading: THREE.FlatShading, wireframe: true } )
	];
	var material	= new THREE.MeshLambertMaterial( { map: generatedTexture } );

	this.mesh	= new THREE.Mesh(geometry, material);

	this.mesh.position.x	= position.x;
	this.mesh.position.y	= position.y;
	this.mesh.rotation.z	= rotation.z;
}

WebyMaze.PlayerCli.prototype.destroy	= function(){
	
}

WebyMaze.PlayerCli.prototype.setCtxTick	= function(ctxTick){
	this.mesh.position.x	= ctxTick.position.x;
	this.mesh.position.y	= ctxTick.position.y;
	this.mesh.rotation.z	= ctxTick.rotation.z;
}

WebyMaze.PlayerCli.prototype.getObject3d	= function(){
	return this.mesh;
}
