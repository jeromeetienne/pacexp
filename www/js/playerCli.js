var WebyMaze	= WebyMaze || {};

//////////////////////////////////////////////////////////////////////////////////
//		ctor/dtor							//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.PlayerCli	= function(){
	// put username/score to null, thus trigger change on next ctxTick
	this.username	= null;
	this.score	= null;
	this.energy	= null;
	
	this.dirtyScore	= false;
	this.dirtyEnergy= false;
	

	// build the canvas + texture
	this.canvasW	= 256;
	this.canvas	= document.createElement('canvas');
	this.canvas.width	= this.canvas.height	= this.canvasW;
	this.texture	= new THREE.Texture(this.canvas);
	this._buildTexture();
	
	this._containerCtor();
}

WebyMaze.PlayerCli.prototype.destroy	= function(){
	
}


//////////////////////////////////////////////////////////////////////////////////
//		tick stuff							//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.PlayerCli.prototype.setCtxTick	= function(ctxTick){
	this._container.position.x	=  ctxTick.position.x;
	this._container.position.z	=  ctxTick.position.y;
	this._container.rotation.y	= -ctxTick.rotation.z;

	if(this.username != ctxTick.username ){
		this.username	= ctxTick.username
		this._buildTexture();
	}
	if(this.score != ctxTick.score){
		this.score	= ctxTick.score
		this.dirtyScore	= true;
	}
	if(this.energy != ctxTick.energy){
		this.energy	= ctxTick.energy;
		this.dirtyEnergy= true;
	}
}

//////////////////////////////////////////////////////////////////////////////////
//		container							//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.PlayerCli.prototype._containerCtor	= function()
{
	// determine if renderer is webGl or not
	var isWebGL	= renderer instanceof THREE.WebGLRenderer;
	// build the texture
//	this._canvasCtor();
	// build this._container
	var bodyW	= 100;

	this._container	= new THREE.Object3D();

	// determine if renderer is webGl or not
	var isWebGL	= renderer instanceof THREE.WebGLRenderer;
	// set the material depending on renderer capabilities
	if( isWebGL ){
		// build the canvas + texture
		var geometry	= new THREE.Sphere( bodyW/2, 32, 16 );
		var material	= [
			//new THREE.MeshLambertMaterial( { color: 0xFFa000, shading: THREE.FlatShading } ),
			//new THREE.MeshPhongMaterial( { ambient: 0x0088aa, color: 0xff5500, specular: 0x555555, shininess: 10 } ),
			//new THREE.MeshPhongMaterial( { ambient: 0xaf5000, color: 0xef9000, specular: 0x0088aa, shininess: 5 } ),
			//new THREE.MeshPhongMaterial( { ambient: 0xffa000, color: 0x999900, specular: 0x000000, shininess: 5 } ),
			//new THREE.MeshLambertMaterial( { map: this.texture } ),
			//new THREE.MeshBasicMaterial( { map: this.texture } ),
			new THREE.MeshPhongMaterial( { ambient: 0xffa000, color: 0x999900, specular: 0x000000, shininess: 5
								, map : this.texture } ),
		];
	}else{
		//var geometry	= new THREE.Sphere( bodyW/2, 16, 8 );
		//var geometry	= new THREE.Cube( bodyW, bodyW/2, bodyW/2 );
		var geometry	= new THREE.Cube( bodyW*0.5, bodyW*0.5, bodyW*0.5, 1, 1, 1, [], 0, { px: true, nx: true, py: true, ny: false, pz: true, nz: true } );
		var material	= [
			new THREE.MeshLambertMaterial( { color: 0x999900, shading: THREE.FlatShading } ),
			
			//new THREE.MeshLambertMaterial( { color: 0x999900, shading: THREE.flatShading } ),
			//new THREE.MeshPhongMaterial( { ambient: 0x0088aa, color: 0xff5500, specular: 0x555555, shininess: 10 } ),
			//new THREE.MeshPhongMaterial( { ambient: 0xaf5000, color: 0xef9000, specular: 0x0088aa, shininess: 5 } ),
			//new THREE.MeshPhongMaterial( { ambient: 0xffa000, color: 0x999900, specular: 0x000000, shininess: 5 } ),
			//new THREE.MeshLambertMaterial( { map: this.texture } ),
		];		
	}

	var mesh	= new THREE.Mesh( geometry, material );
	this._container.addChild( mesh );
	
	// do the shaddow
	if( isWebGL ){
		var mesh	= new THREE.Mesh(
			new THREE.Plane( bodyW, bodyW ),
			new THREE.MeshLambertMaterial( { map: THREEx.Texture.Smiley.shaddowTexture(), opacity: 0.5 } )
		);
		mesh.position.y	= -bodyW/2 + 1;
		mesh.rotation.x	= - 90 * ( Math.PI / 180 );
		mesh.overdraw	= true;
		this._container.addChild( mesh );		
	}
}

WebyMaze.PlayerCli.prototype.obj3d	= function(){
	return this._container;
}

//////////////////////////////////////////////////////////////////////////////////
//		handle avatar							//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.PlayerCli.prototype._buildTexture	= function()
{
	var isTwitterName	= this.username && !this.username.match(/^guest/);
	if( isTwitterName ){
		this._twitterAvatarLoad();
	}else{
		this._buildSmileyTexture();
	}
}

/**
 * - twitter api got a rate limit of 150req/s ... use it wisely
 *   - maybe cache the avatar url in localStore
*/
WebyMaze.PlayerCli.prototype._twitterAvatarLoad	= function()
{
	console.log("loadavatar", this.username)
	// keep default avatar if it is a guest
	console.assert( this.username.match(/^guest/) === null );

	// 
	var twitterName	= this.username;
	var apiUrl	= 'http://twitter.com/users/'+twitterName+'.json?callback=?';
	jQuery.getJSON(apiUrl, function(data){
		// here the image from twitter is 48x48 and ends with _normal.png
		// - it is possible to get a 73x73 with a _bigger.png
		var imgUrl	= data.profile_image_url;
		
		// trick to get larger images
		// - the end of the base name gives the size of the image
		// - "_normal" = 48x48 image
		// - "_bigger" = 73x73 image
		// - http://a1.twimg.com/profile_images/764871885/yo_normal.jpg
		// - http://a1.twimg.com/profile_images/764871885/yo_bigger.jpg
		imgUrl		= imgUrl.replace('_normal', '_bigger');
		console.log("avatar from", this.username, "is", imgUrl)
		
		imgUrl	= "http://localhost/~jerome/webwork/tweetymaze/www/redir?url="+imgUrl;
		
		// load the image
		var img		= new Image();
		img.onload	= function(){
			console.log("image downloaded from", imgUrl)
			this._buildTwitterAvatarTexture(img);
		}.bind(this);
		img.src		= imgUrl;	
	}.bind(this))	
}

/**
 * @param {DOMElement} img the <image> to map on the canvas for the texture
*/
WebyMaze.PlayerCli.prototype._buildTwitterAvatarTexture	= function(img)
{
	var canvas	= this.canvas;
	var w		= canvas.width;
	var ctx		= canvas.getContext( '2d' );

	var avatarW	= w/3;
	var avatarH	= w/3;
	var avatarDy	= -w/16;
	
	// clear the previous texture
	ctx.fillStyle = "#FF9900";
	ctx.fillRect(0, 0, w, w);

	// draw one half
	ctx.save();
	ctx.translate(w, avatarDy+w/2)
	ctx.drawImage(img, -avatarW/2, -avatarH/2, avatarW, avatarH)
	ctx.restore();
	// draw other half
	ctx.save();
	ctx.translate(0, avatarDy+w/2)
	ctx.drawImage(img, -avatarW/2, -avatarH/2, avatarW, avatarH)
	ctx.restore();
	
	var textData	= "@"+this.username
	ctx.save();
	ctx.translate(w/2, w/2)
	//ctx.font	= "15px Arial";
	ctx.font	= "bolder 10pt Arial";	
	var textW	= ctx.measureText(textData).width;
	ctx.fillStyle	= "rgb(0,0,0)";
	console.log("measutreText", ctx.measureText(textData));
	ctx.fillText(textData, -textW/2, avatarDy);
	ctx.restore();

	// mark this texture as "needsUpdate"
	this.texture.needsUpdate = true;
}

//////////////////////////////////////////////////////////////////////////////////
//		handle smiley							//
//////////////////////////////////////////////////////////////////////////////////

/**
 * @param {DOMElement} img the <image> to map on the canvas for the texture
*/
WebyMaze.PlayerCli.prototype._buildSmileyTexture	= function()
{
	var w	= this.canvas.width;
	var ctx	= this.canvas.getContext( '2d' );
	// clear the previous texture
	ctx.fillStyle = "#FF99FF";
	ctx.fillRect(0, 0, w, w);

	THREEx.Texture.Smiley.happy(this.canvas);
	THREEx.Texture.Smiley.textOnBack(this.canvas, 'Packy');

	// mark this texture as "needsUpdate"
	this.texture.needsUpdate = true;
}

/**
 * @param {DOMElement} img the <image> to map on the canvas for the texture
*/
WebyMaze.PlayerCli.prototype._buildHurtTexture	= function()
{
	// 
	THREEx.Texture.Smiley.hurt(this.canvas);

	// mark this texture as "needsUpdate"
	this.texture.needsUpdate = true;
}
