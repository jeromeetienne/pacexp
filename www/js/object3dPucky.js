var WebyMaze	= WebyMaze || {};

//////////////////////////////////////////////////////////////////////////////////
//		ctor/dtor							//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.Object3dPucky	= function(opts)
{
	this._appearance= opts.appearance	|| console.assert(false);

	// build the canvas + texture
	this._canvasW	= 256;
	this._canvas	= document.createElement('canvas');
	this._canvas.width	= this._canvasW;
	this._canvas.height	= this._canvasW;
	this._texture	= new THREE.Texture(this._canvas);
	this._buildTexture();


	this._container	= new THREE.Object3D();
	this._containerCtor();	
}

WebyMaze.Object3dPucky.prototype.destroy	= function()
{
}

//////////////////////////////////////////////////////////////////////////////////
//		colorTypes							//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.Object3dPucky.colorTypes	= {};
WebyMaze.Object3dPucky.colorTypes.yellow	= {
	phongAmbient		: 0xffa000,
	phongColor		: 0x999999,
	phongSpecular		: 0x000000,
	phongShininess		: 5,
	textureTwitterFillStyle	: "#FFFFFF",
	textureSmileyFillStyle	: "#FF99FF"
};

WebyMaze.Object3dPucky.colorTypes.red	= {
	phongAmbient		: 0xDC143C,
	phongColor		: 0x5500aa,
	phongSpecular		: 0x555555,
	phongShininess		: 10,
	textureTwitterFillStyle	: "#FFFFFF",
	textureSmileyFillStyle	: "#ff99ff"
};

WebyMaze.Object3dPucky.colorTypes.pink	= {
	phongAmbient		: 0xff8080,
	phongColor		: 0x5500aa,
	phongSpecular		: 0x555555,
	phongShininess		: 10,
	textureTwitterFillStyle	: "#FFFFFF",
	textureSmileyFillStyle	: "#ff99ff"
};

WebyMaze.Object3dPucky.colorTypes.orange= {
	phongAmbient		: 0xff4500,
	phongColor		: 0x5500aa,
	phongSpecular		: 0x555555,
	phongShininess		: 10,
	textureTwitterFillStyle	: "#FFFFFF",
	textureSmileyFillStyle	: "#ff99ff"
};

WebyMaze.Object3dPucky.colorTypes.lightblue= {
	phongAmbient		: 0x3DC5CC,
	phongColor		: 0x5500aa,
	phongSpecular		: 0x555555,
	phongShininess		: 10,
	textureTwitterFillStyle	: "#FFFFFF",
	textureSmileyFillStyle	: "#ff99ff"
};

WebyMaze.Object3dPucky.colorTypes.blue= {
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
 * Setter for this._appearance
*/
WebyMaze.Object3dPucky.prototype.setAppearance	= function(appearance)
{
	console.log("SetAppearance from ", this._appearance, "to", appearance);
	if( appearance.match(/^eyes-/) )	appearance	= "hurt-yellow-Ouch!";
	
	// if appearance didnt change, do nothing
	if( appearance === this._appearance )	return;


	this._appearance	= appearance;

	if( this._container ){
		console.log("remove the previous _container")
		// TODO ugly.... FIXME
		scene.removeObject(this._container)
	}
	this._containerCtor();

	this._buildTexture();
}

/**
 * Getter for this._appearance
*/
WebyMaze.Object3dPucky.prototype.getAppearance	= function(appearance)
{
	return this._appearance;
}

WebyMaze.Object3dPucky.prototype._textureType	= function()
{
	return this._appearance.match(/^(.*)-(.*)-(.*)/)[1];
}

WebyMaze.Object3dPucky.prototype._colorStr	= function()
{
	return this._appearance.match(/^(.*)-(.*)-(.*)/)[2];
}

WebyMaze.Object3dPucky.prototype._nameStr	= function()
{
	return this._appearance.match(/^(.*)-(.*)-(.*)/)[3];
}

WebyMaze.Object3dPucky.prototype.object3d	= function()
{
	return this._container;
}

WebyMaze.Object3dPucky.prototype.dirty		= function(val)
{
	if( typeof val !== 'undefined' )	this._dirtyObj3d	= val;
	return this._dirtyObj3d;
}

//////////////////////////////////////////////////////////////////////////////////
//		container							//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.Object3dPucky.prototype._containerCtor	= function()
{
	var colorType	= WebyMaze.Object3dPucky.colorTypes[this._colorStr()];
	// build this._container
	var bodyW	= 100;
	
	// this._container MUST have been created
	console.assert( this._container );

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
			//new THREE.MeshLambertMaterial( { map: this._texture } ),
			//new THREE.MeshBasicMaterial( { map: this._texture } ),
			//new THREE.MeshPhongMaterial( { ambient: 0xffa000, color: 0x999900, specular: 0x000000, shininess: 5
			//					, map : this._texture } ),
			new THREE.MeshPhongMaterial({
				ambient		: colorType.phongAmbient,
				color		: colorType.phongColor,
				specular	: colorType.phongSpecular,
				shininess	: colorType.phongShininess,
				map		: this._texture
			})
			//new THREE.MeshLambertMaterial( { color: 0x999900, shading: THREE.SmoothShading, opacity: 0.5 } ),
			//new THREE.MeshPhongMaterial({
			//	ambient		: this._colorType.phongAmbient,
			//	color		: this._colorType.phongColor,
			//	specular	: this._colorType.phongSpecular,
			//	shininess	: this._colorType.phongShininess
			//}),
			//new THREE.MeshBasicMaterial( { map: this._texture } )
		];
		var mesh	= new THREE.Mesh( geometry, material );
		this._container.addChild( mesh );
	}else{
		//var geometry	= new THREE.Sphere( bodyW/2, 16, 8 );
		//var geometry	= new THREE.Cube( bodyW, bodyW/2, bodyW/2 );
		//var geometry	= new THREE.Cube( bodyW*0.5, bodyW*0.5, bodyW*0.5, 1, 1, 1, [], 0, { px: true, nx: true, py: true, ny: false, pz: true, nz: true } );
		var geometry	= new THREE.Cylinder( 8, bodyW*0.1, bodyW/3, bodyW/2, 0, bodyW/2);

		var material	= [
			new THREE.MeshLambertMaterial( { color: 0x999900, shading: THREE.FlatShading } ),
			
			//new THREE.MeshLambertMaterial( { color: 0x999900, shading: THREE.FlatShading } ),
			//new THREE.MeshPhongMaterial( { ambient: 0x0088aa, color: 0xff5500, specular: 0x555555, shininess: 10 } ),
			//new THREE.MeshPhongMaterial( { ambient: 0xaf5000, color: 0xef9000, specular: 0x0088aa, shininess: 5 } ),
			//new THREE.MeshPhongMaterial( { ambient: 0xffa000, color: 0x999900, specular: 0x000000, shininess: 5 } ),
			//new THREE.MeshLambertMaterial( { map: this._texture } ),
		];		
		var mesh	= new THREE.Mesh( geometry, material );
		mesh.rotation.y	= - 90 * ( Math.PI / 180 );
		this._container.addChild( mesh );
	}

	
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

WebyMaze.Object3dPucky.prototype._buildTexture	= function()
{
	var username		= this._nameStr();
	var isTwitterName	= username && username.charAt('@') === '@';
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
WebyMaze.Object3dPucky.prototype._twitterAvatarLoad	= function()
{
	var username	= this._nameStr();
	console.log("loadavatar", username)

	// 
	var twitterName	= username;
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
		console.log("avatar from", username, "is", imgUrl)
		
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
WebyMaze.Object3dPucky.prototype._buildTwitterAvatarTexture	= function(img)
{
	var colorType	= WebyMaze.Object3dPucky.colorTypes[this._colorStr()];
	var canvas	= this._canvas;
	var w		= canvas.width;
	var ctx		= canvas.getContext( '2d' );

	var avatarW	= w/3;
	var avatarH	= w/3;
	var avatarDy	= -w/16;
	
	// clear the previous texture
	ctx.fillStyle	= colorType.textureTwitterFillStyle;
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
	
	var textData	= this._nameStr();
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
	this._texture.needsUpdate = true;
}


//////////////////////////////////////////////////////////////////////////////////
//		handle smiley							//
//////////////////////////////////////////////////////////////////////////////////

/**
 * @param {DOMElement} img the <image> to map on the canvas for the texture
*/
WebyMaze.Object3dPucky.prototype._buildSmileyTexture	= function()
{
	var colorType	= WebyMaze.Object3dPucky.colorTypes[this._colorStr()];
	var textureType	= this._textureType();
	var username	= this._nameStr();
	var w		= this._canvas.width;
	var ctx		= this._canvas.getContext( '2d' );
	console.log("colorStr",this._colorStr(), "textureType", textureType);

	// clear the previous texture
	ctx.fillStyle	= colorType.textureSmileyFillStyle;
	ctx.fillRect(0, 0, w, w);

	THREEx.Texture.Smiley[textureType](this._canvas);
	THREEx.Texture.Smiley.textOnBack(this._canvas, username);

	// mark this texture as "needsUpdate"
	this._texture.needsUpdate = true;
}
