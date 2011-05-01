var WebyMaze	= WebyMaze || {};

//////////////////////////////////////////////////////////////////////////////////
//		ctor/dtor							//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.Object3dPacky	= function(opts)
{
	this._username	= opts.username		|| console.assert(false);
	this._colorType	= opts.colorType	|| WebyMaze.Object3dPacky.colorTypes.yellow;

	// build the canvas + texture
	this.canvasW	= 256;
	this.canvas	= document.createElement('canvas');
	this.canvas.width	= this.canvas.height	= this.canvasW;
	this.texture	= new THREE.Texture(this.canvas);

	this._buildTexture();
	this._containerCtor();	
}

WebyMaze.Object3dPacky.prototype.destroy	= function(){
}

//////////////////////////////////////////////////////////////////////////////////
//		colorTypes							//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.Object3dPacky.colorTypes	= {};
WebyMaze.Object3dPacky.colorTypes.yellow	= {
	phongAmbient		: 0xffa000,
	phongColor		: 0x999999,
	phongSpecular		: 0x000000,
	phongShininess		: 5,
	textureTwitterFillStyle	: "#FFFFFF",
	textureSmileyFillStyle	: "#FF99FF"
};

WebyMaze.Object3dPacky.colorTypes.red	= {
	phongAmbient		: 0xDC143C,
	phongColor		: 0x5500aa,
	phongSpecular		: 0x555555,
	phongShininess		: 10,
	textureTwitterFillStyle	: "#FFFFFF",
	textureSmileyFillStyle	: "#ff99ff"
};

WebyMaze.Object3dPacky.colorTypes.pink	= {
	phongAmbient		: 0xff8080,
	phongColor		: 0x5500aa,
	phongSpecular		: 0x555555,
	phongShininess		: 10,
	textureTwitterFillStyle	: "#FFFFFF",
	textureSmileyFillStyle	: "#ff99ff"
};

WebyMaze.Object3dPacky.colorTypes.orange= {
	phongAmbient		: 0xff4500,
	phongColor		: 0x5500aa,
	phongSpecular		: 0x555555,
	phongShininess		: 10,
	textureTwitterFillStyle	: "#FFFFFF",
	textureSmileyFillStyle	: "#ff99ff"
};

WebyMaze.Object3dPacky.colorTypes.lightBlue= {
	phongAmbient		: 0x3DC5CC,
	phongColor		: 0x5500aa,
	phongSpecular		: 0x555555,
	phongShininess		: 10,
	textureTwitterFillStyle	: "#FFFFFF",
	textureSmileyFillStyle	: "#ff99ff"
};

WebyMaze.Object3dPacky.colorTypes.blue= {
	phongAmbient		: 0x00a0FF,
	phongColor		: 0x0044aa,
	phongSpecular		: 0x555555,
	phongShininess		: 10,
	textureTwitterFillStyle	: "#FFFFFF",
	textureSmileyFillStyle	: "#ff99ff"
};

//////////////////////////////////////////////////////////////////////////////////
//		container							//
//////////////////////////////////////////////////////////////////////////////////

/**
 * Getter/Setter for username
*/
WebyMaze.Object3dPacky.prototype.setUsername	= function(val)
{
	this._username	= val;
console.log("setUsername", this._username)
	this._buildTexture();
}

WebyMaze.Object3dPacky.prototype.object3d	= function()
{
	return this._container;
}

WebyMaze.Object3dPacky.prototype.dirty		= function(val)
{
	return false;
}

//////////////////////////////////////////////////////////////////////////////////
//		container							//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.Object3dPacky.prototype._containerCtor	= function()
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
			//new THREE.MeshPhongMaterial( { ambient: 0xffa000, color: 0x999900, specular: 0x000000, shininess: 5
			//					, map : this.texture } ),
			new THREE.MeshPhongMaterial({
				ambient		: this._colorType.phongAmbient,
				color		: this._colorType.phongColor,
				specular	: this._colorType.phongSpecular,
				shininess	: this._colorType.phongShininess,
				map		: this.texture
			})

			//new THREE.MeshPhongMaterial({
			//	ambient		: this._colorType.phongAmbient,
			//	color		: this._colorType.phongColor,
			//	specular	: this._colorType.phongSpecular,
			//	shininess	: this._colorType.phongShininess
			//}),
			//new THREE.MeshBasicMaterial( { map: this.texture } )
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

//////////////////////////////////////////////////////////////////////////////////
//		handle avatar							//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.Object3dPacky.prototype._buildTexture	= function()
{
	var isTwitterName	= this._username && !this._username.match(/^guest/);
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
WebyMaze.Object3dPacky.prototype._twitterAvatarLoad	= function()
{
	console.log("loadavatar", this._username)
	// keep default avatar if it is a guest
	console.assert( this._username.match(/^guest/) === null );

	// 
	var twitterName	= this._username;
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
		console.log("avatar from", this._username, "is", imgUrl)
		
		imgUrl	= "redir?url="+imgUrl;
		
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
WebyMaze.Object3dPacky.prototype._buildTwitterAvatarTexture	= function(img)
{
	var canvas	= this.canvas;
	var w		= canvas.width;
	var ctx		= canvas.getContext( '2d' );

	var avatarW	= w/3;
	var avatarH	= w/3;
	var avatarDy	= -w/16;
	
	// clear the previous texture
	ctx.fillStyle = this._colorType.textureTwitterFillStyle;
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
	
	var textData	= this._username
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
WebyMaze.Object3dPacky.prototype._buildSmileyTexture	= function()
{
	var w	= this.canvas.width;
	var ctx	= this.canvas.getContext( '2d' );
	// clear the previous texture
	ctx.fillStyle = this._colorType.textureSmileyFillStyle;
	ctx.fillRect(0, 0, w, w);

	THREEx.Texture.Smiley.happy(this.canvas);
	THREEx.Texture.Smiley.textOnBack(this.canvas, 'Packy');

	// mark this texture as "needsUpdate"
	this.texture.needsUpdate = true;
}

/**
 * @param {DOMElement} img the <image> to map on the canvas for the texture
*/
WebyMaze.Object3dPacky.prototype._buildHurtTexture	= function()
{
	// 
	THREEx.Texture.Smiley.hurt(this.canvas);

	// mark this texture as "needsUpdate"
	this.texture.needsUpdate = true;
}

