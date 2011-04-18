var WebyMaze	= WebyMaze || {};

//////////////////////////////////////////////////////////////////////////////////
//		minimap								//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.MinimapRender	= function(opts)
{
	this._mazeCli	= opts.mazeCli	|| console.assert(false);

	this._canvasW	= this._canvasH	= 256;
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

WebyMaze.MinimapRender.prototype._containerCtor	= function()
{
	// create the sprite
	this._spriteWall	= new THREE.Sprite({
		//map			: THREE.ImageUtils.loadTexture('images/lensFlare/Flare2.png'),
		map			: this._mapTexture(),
		blending		: THREE.NormalBlending,
		//blending		: THREE.SubtractiveBlending,
		//blending		: THREE.AdditiveBlending,
		useScreenCoordinates	: true
	});
	this._spriteWall.position.x	= 300;
	this._spriteWall.position.y	= 300;
	
	this._spriteWall.scale.x	= 0.5;
	this._spriteWall.scale.y	= 0.5;

	// put it ina container
	this._container	= new THREE.Object3D();
	this._container.addChild(this._spriteWall)
}


//////////////////////////////////////////////////////////////////////////////////
//		misc								//
//////////////////////////////////////////////////////////////////////////////////

var time	= 0;
WebyMaze.MinimapRender.prototype.update	= function(urBodyId, players, enemies)
{
	//this._texture.needsUpdate = true
	
	var targetObj3d	= players[urBodyId].obj3d();
	this._spriteWall.rotation	= targetObj3d.rotation.y + 90*Math.PI/180;
	

	
return;
	var ctx	= this._canvas.getContext( '2d' );

//this._renderMap2Canvas(this._canvas);
	
	var space2canvasX	= function(spaceX){
		var offsetX	= Math.floor(this._mazeCli.mapW()/2)
		var scaledX	= spaceX / this._mazeCli.tileW;
		return (scaledX + offsetX) * this._tileW;
	}.bind(this);
	var space2canvasY	= function(spaceY){
		var offsetY	= Math.floor(this._mazeCli.mapH()/2)
		var scaledY	= spaceY / this._mazeCli.tileH;
		return (scaledY + offsetY) * this._tileH;
	}.bind(this);

	ctx.fillStyle	= "rgb(255,0, 0)";
	
	Object.keys(enemies).forEach(function(enemyId){
		var enemy	= enemies[enemyId];
		var colorStr	= enemy.colorStr();
		var spaceX	= enemy.obj3d().position.x;
		var spaceY	= enemy.obj3d().position.z;
		var canvasX	= space2canvasX(spaceX);
		var canvasY	= space2canvasY(spaceY);
		
		ctx.fillRect(canvasX, canvasY, this._tileW, this._tileH);
	}.bind(this));


	ctx.fillStyle	= "rgb(255,255, 0)";
	Object.keys(players).forEach(function(playerId){
		var player	= players[playerId];
		var spaceX	= player.obj3d().position.x;
		var spaceY	= player.obj3d().position.z;
		var canvasX	= space2canvasX(spaceX);
		var canvasY	= space2canvasY(spaceY);
		ctx.fillRect(canvasX, canvasY, this._tileW, this._tileH);
	}.bind(this));

	this._texture.needsUpdate = true
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

	var map2canvasX	= function(mapX){ return mapX * this._tileW; }.bind(this);
	var map2canvasY	= function(mapY){ return mapY * this._tileH; }.bind(this);

	this._mazeCli.mapForEach(function(mapX, mapY, mapChar){
		if( mapChar == '*' )	return;
		var canvasX	= map2canvasX(mapX);
		var canvasY	= map2canvasY(mapY);
		ctx.fillRect(canvasX, canvasY, this._tileW, this._tileH);
	}.bind(this));
}

