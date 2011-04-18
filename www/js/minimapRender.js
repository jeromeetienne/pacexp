var WebyMaze	= WebyMaze || {};

//////////////////////////////////////////////////////////////////////////////////
//		minimap								//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.MinimapRender	= function(opts)
{
	this._mazeCli	= opts.mazeCli	|| console.assert(false);

	this._canvasW	= this._canvasH	= 128;
	this._scale	= 2;
	this._posX	= 300;
	this._posY	= 300;

	this._tileW	= this._canvasW/this._mazeCli.mapW();
	this._tileH	= this._canvasH/this._mazeCli.mapH();


	this._containerCtor();
}

WebyMaze.MinimapRender.prototype.destroy	= function()
{
}

WebyMaze.MinimapRender.prototype.obj3d	= function(){
	return this._container;
}

WebyMaze.MinimapRender.prototype.map2canvasX	= function(mapX)
{
	return mapX * this._tileW;
}

WebyMaze.MinimapRender.prototype.map2canvasY	= function(mapY)
{
	return mapY * this._tileH;
}

WebyMaze.MinimapRender.prototype._containerCtor	= function()
{
	// create the sprite
	this._spriteWall	= new THREE.Sprite({
		//map			: THREE.ImageUtils.loadTexture('images/lensFlare/Flare2.png'),
		map			: this._mapTexture(),
		//blending		: THREE.NormalBlending,
		//blending		: THREE.SubtractiveBlending,
		//blending		: THREE.AdditiveBlending,
		useScreenCoordinates	: true
	});
	this._spriteWall.position.x	= this._posX;
	this._spriteWall.position.y	= this._posY;

	this._spriteWall.scale.x	= this._scale;
	this._spriteWall.scale.y	= this._scale;

	// put it ina container
	this._container	= new THREE.Object3D();
	this._container.addChild(this._spriteWall)
}

WebyMaze.MinimapRender.prototype._mapTexture	= function()
{
	// create the texture
	var canvas	= document.createElement('canvas');
	canvas.width	= this._canvasW;
	canvas.height	= this._canvasH;
	var texture	= new THREE.Texture(canvas);
	
	this._renderMap2Canvas( canvas );
	texture.needsUpdate = true
	
	return texture;
}

WebyMaze.MinimapRender.prototype._renderMap2Canvas	= function(canvas)
{
	var w	= canvas.width;
	var ctx	= canvas.getContext( '2d' );
	
	ctx.clearRect(0,0, w, w);

	ctx.fillStyle	= "#FF8C00";

	this._mazeCli.mapForEach(function(mapX, mapY, mapChar){
		if( mapChar == '*' )	return;
		var canvasX	= this.map2canvasX(mapX);
		var canvasY	= this.map2canvasY(mapY);
		ctx.fillRect(canvasX, canvasY, this._tileW, this._tileH);
	}.bind(this));
}

//////////////////////////////////////////////////////////////////////////////////
//		misc								//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.MinimapRender.prototype.update	= function(opts)
{
	var urBodyId	= opts.urBodyId		|| console.assert(false);
	var players	= opts.players		|| console.assert(false);
	var enemies	= opts.enemies		|| console.assert(false);
	var rotationType= opts.rotationType	|| console.assert(false);
	//this._texture.needsUpdate = true
	
	var targetObj3d	= players[urBodyId].obj3d();

	var space2mapX	= function(spaceX){ return spaceX / this._tileW + Math.floor(this._mazeCli.mapW()/2);	}.bind(this);
	var space2mapY	= function(spaceY){ return spaceY / this._tileH + Math.floor(this._mazeCli.mapH()/2);	}.bind(this);
	
	var mapX	= space2mapX(targetObj3d.position.z);
	var mapY	= space2mapY(targetObj3d.position.x);
	var canvasX	= this.map2canvasX( mapX );
	var canvasY	= this.map2canvasY( mapY );

	this._spriteWall.position.x	= this._posX;
	this._spriteWall.position.y	= this._posY;

	// do the rotation
	if( rotationType === "relative" ){
		this._spriteWall.rotation	= -targetObj3d.rotation.y + 90*Math.PI/180;
	}else if( rotationType === 'absolute' ){
		this._spriteWall.rotation	= -90*Math.PI/180;
	}else console.assert(false, "rotationType "+rotationType+" is unknown")
}


