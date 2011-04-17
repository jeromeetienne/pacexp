var WebyMaze	= WebyMaze || {};

//////////////////////////////////////////////////////////////////////////////////
//		ctor/dtor							//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.PlayerCli	= function(){
	// put username/score to null, thus trigger change on next ctxTick
	this.username	= null;
	this.score	= null;
	
	// TODO rename this dirtyScore
	this.dirtyScore	= false;
	
	this._containerCtor();
}

WebyMaze.PlayerCli.prototype.destroy	= function(){
	
}


//////////////////////////////////////////////////////////////////////////////////
//		tick stuff							//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.PlayerCli.prototype.setCtxTick	= function(ctxTick){
	this._container.position.x	= ctxTick.position.x;
	this._container.position.z	= ctxTick.position.y;
	this._container.rotation.y	= -ctxTick.rotation.z;

console.log("player rot z", this._container.rotation.y);
	
	if(this.username != ctxTick.username){
		this.username	= ctxTick.username
		this._avatarLoad();
	}
	if(this.score != ctxTick.score){
		this.score	= ctxTick.score
		this.dirtyScore	= true;
	}
}

//////////////////////////////////////////////////////////////////////////////////
//		container							//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.PlayerCli.prototype._canvasCtor	= function(){
	this.canvas	= document.createElement('canvas');
	this.canvas.width	= this.canvas.height	= 256;
	// build the structure
	this.texture	= new THREE.Texture(this.canvas);


this.buildSmileyTexture();
////this.buildHurtTexture();
return;

	// load the default avatar
	var img	= document.getElementById('avatar');	
	if( img ){
		this._avatarBuildTexture(img);
	}else{
		// create default avatar if not yet done
		img		= new Image();
		img.id		= 'avatar';
		img.style.display='none';
		img.onload	= function(){
			this._avatarBuildTexture(img);
		}.bind(this);
		img.src		= "images/default_avatar_bigger.png";
		document.body.appendChild(img);
	}
}

WebyMaze.PlayerCli.prototype._containerCtor	= function(){
	// build the texture
	this._canvasCtor();
	// build this._container
	var bodyW	= 100;


	this._container	= new THREE.Object3D();

	var material	= [
		//new THREE.MeshLambertMaterial( { color: 0xFFa000, shading: THREE.flatShading } ),
		//new THREE.MeshPhongMaterial( { ambient: 0x0088aa, color: 0xff5500, specular: 0x555555, shininess: 10 } ),
		//new THREE.MeshPhongMaterial( { ambient: 0xaf5000, color: 0xef9000, specular: 0x0088aa, shininess: 5 } ),
		new THREE.MeshPhongMaterial( { ambient: 0xffa000, color: 0x999900, specular: 0x000000, shininess: 5 } ),
		new THREE.MeshLambertMaterial( { map: this.texture } ),
	];
	var geometry	= new THREE.Sphere( bodyW/2, 32, 16 );
	var mesh	= new THREE.Mesh( geometry, material );
	this._container.addChild( mesh );
	
	// do the shaddow
	var mesh		= new THREE.Mesh(
		new THREE.Plane( bodyW, bodyW ),
		new THREE.MeshLambertMaterial( { map: THREEx.Texture.Smiley.shaddowTexture(), opacity: 0.5 } )
	);
	mesh.position.y	= -bodyW/2 + 1;
	mesh.rotation.x	= - 90 * ( Math.PI / 180 );
	mesh.overdraw	= true;
	this._container.addChild( mesh );
}

WebyMaze.PlayerCli.prototype.obj3d	= function(){
	return this._container;
}

//////////////////////////////////////////////////////////////////////////////////
//		handle avatar							//
//////////////////////////////////////////////////////////////////////////////////

/**
 * @param {DOMElement} img the <image> to map on the canvas for the texture
*/
WebyMaze.PlayerCli.prototype._avatarBuildTexture	= function(img){
	var canvas	= this.canvas;
	var w		= canvas.width;
	var ctx		= canvas.getContext( '2d' );

	var avatarW	= w/3;
	var avatarH	= w/3;
	var avatarDy	= -w/16;

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
	ctx.font	= "10px Arial";
	var textW	= ctx.measureText(textData).width;
	ctx.strokeStyle	= "rgb(0,0,0)";
	console.log("measutreText", ctx.measureText(textData));
	ctx.strokeText(textData, -textW/2, 0);
	ctx.restore();

	// mark this texture as "needsUpdate"
	this.texture.needsUpdate = true;
}

/**
 * - twitter api got a rate limit of 150req/s ... use it wisely
 *   - maybe cache the avatar url in localStore
*/
WebyMaze.PlayerCli.prototype._avatarLoad	= function(){
	console.log("loadavatar", this.username)
	// keep default avatar if it is a guest
	if( this.username.match(/^guest/) )	return;

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
		// load the image
		var img		= new Image();
		img.onload	= function(){
			this._avatarBuildTexture(img);
		}.bind(this);
		img.src		= imgUrl;	
	}.bind(this))	
}

//////////////////////////////////////////////////////////////////////////////////
//		handle smiley							//
//////////////////////////////////////////////////////////////////////////////////

/**
 * @param {DOMElement} img the <image> to map on the canvas for the texture
*/
WebyMaze.PlayerCli.prototype.buildSmileyTexture	= function()
{
	var canvasW	= 64;
	var canvas	= document.createElement('canvas');
	canvas.width	= canvas.height	= canvasW;
	var texture	= new THREE.Texture(canvas);

	THREEx.Texture.Smiley.happy(this.canvas);
	THREEx.Texture.Smiley.textOnBack(this.canvas, 'Packy');

	// mark this texture as "needsUpdate"
	this.texture.needsUpdate = true;
}

/**
 * @param {DOMElement} img the <image> to map on the canvas for the texture
*/
WebyMaze.PlayerCli.prototype.buildHurtTexture	= function(){
	// 
	THREEx.Texture.Smiley.hurt(this.canvas);

	// mark this texture as "needsUpdate"
	this.texture.needsUpdate = true;
}
