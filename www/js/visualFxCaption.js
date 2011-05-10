/** @namespace */
var WebyMaze	= WebyMaze || {};

//////////////////////////////////////////////////////////////////////////////////
//		ctor/dtor							//
//////////////////////////////////////////////////////////////////////////////////

/**
 * contructor
 * 
 * TODO make an animation
 * - 2 tweens... one on the scale to make the sphere grow
 * - one to change the opacity
 * - maybe several spheres to give an impression of smoke
*/
WebyMaze.VisualFxCaption	= function(opts)
{
	var webglRender	= opts.webglRender	|| console.assert(false);
	var position	= opts.position		|| console.assert(false);
	var textData	= opts.textData		|| console.assert(false);
	this._timeToLive= opts.timeToLive	|| 2*1000;

	// store this._createdAt to honor this._timeToLive
	this._createdAt	= new Date;

	// build this._container
	// determine if renderer is webGl or not
	var isWebGL	= renderer instanceof THREE.WebGLRenderer;
	if( isWebGL ){
		this._container	= new THREE.Sprite({
			map			: THREEx.Texture.Caption.textTexture(textData, 256),
			//map			: THREE.ImageUtils.loadTexture('images/lensFlare/Flare2.png'),
			//blending		: THREE.AdditiveBlending,
			useScreenCoordinates	: false
		});
		this._container.scale.set( 1, -1, 0.50 );
	}else{
		var geometry	= new THREE.Cube( this._bodyW/3, this._bodyW/3, this._bodyW/3, 1, 1, 1, [], 0, { px: true, nx: true, py: true, ny: false, pz: true, nz: true } );
		var material	= new THREE.MeshLambertMaterial( { color: 0xFFFFFF, shading: THREE.FlatShading, opacity: 0.3 } );
		this._container	= new THREE.Mesh(geometry, material);
	}

	if( 'x' in position ){
		this._container.position.x	= position.x;
		this._container.position.z	= position.y;
	}else{
		var enemyId	= position.bodyId;
		var enemy	= webglRender.getEnemies()[enemyId];
		this._$postTickCb	= function(){
			this._container.position.x	= enemy.obj3d().position.x;
			this._container.position.y	= 75;
			this._container.position.z	= enemy.obj3d().position.z;			
		}.bind(this);
		enemy.bind("postTick", this._$postTickCb);
		this._$postTickCb();
	}
}

/**
*/
WebyMaze.VisualFxCaption.prototype.destroy	= function()
{
	// TODO dehook
}

// mixin MicroEvent 
MicroEvent.mixin(WebyMaze.VisualFxCaption);

//////////////////////////////////////////////////////////////////////////////////
//		misc								//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.VisualFxCaption.prototype.tick	= function()
{
	// honor this._timeToLive if needed
	if( this._timeToLive ){
		var present	= new Date();
		var age		= present - this._createdAt;
		if( age > this._timeToLive )	this.trigger('autodestroy');
	}
}

/**
 * Return the object3d containing this one
*/
WebyMaze.VisualFxCaption.prototype.obj3d	= function(){
	return this._container;
}
