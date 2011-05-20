/**
 * TODO Global var... to remove
*/
var camera, scene, renderer;

var sceneContainer;

var soundRender	= null;
var gameCli	= null;
var gameConfig	= null;

//////////////////////////////////////////////////////////////////////////////////
//		ctor/dtor							//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.PageGame	= function(opts)
{
	// get parameters from options	
	this._roundInitCtx	= opts.roundInitCtx	|| console.assert(false);
	// show the page
	jQuery("#gamePageContainer").show();
	
	this._stats		= null;
	this._container		= null;
	this._requestAnimId	= null;
	
	gameCli		= new WebyMaze.GameCli({
		roundInitCtx	: this._roundInitCtx
	});
	gameCli.bind('autodestroy', function(){
		console.log("autodestroy", this)
		
		this.trigger('autodestroy');
		console.log("autodestroyed done")
	}.bind(this))
	gameConfig	= new WebyMaze.ConfigStore();
	soundRender	= new WebyMaze.SoundRender({
		enableTrack	: gameConfig.soundTrack() === "true",
		enableFx	: gameConfig.soundFx() === "true"
	});
	this._init();

	this._animate();	
}

WebyMaze.PageGame.prototype.destroy	= function()
{
	if( gameCli ){
		gameCli.destroy();
		gameCli	= null;
	}
	if( gameConfig){
		gameConfig.destroy();
		gameConfig	= null;
	}
	if( soundRender ){
		soundRender.destroy();
		soundRender	= null;
	}
	// stop animate stuff
	if( this._requestAnimId )	cancelRequestAnimationFrame(this._requestAnimId);
	// hide the page
	jQuery("#gamePageContainer").hide();
}

// mixin MicroEvent 
MicroEvent.mixin(WebyMaze.PageGame);

//////////////////////////////////////////////////////////////////////////////////
//										//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.PageGame.prototype._init	= function()
{
	var configScene	= WebyMaze.ConfigCli.scene;
	//camera = new THREE.Camera(60, window.innerWidth / window.innerHeight, 1, 2800 );
	camera = new THREE.Camera(configScene.cameraFov, window.innerWidth / window.innerHeight, configScene.cameraNear, configScene.cameraFar);

	scene = new THREE.Scene();
	sceneContainer = new THREE.Object3D();
	scene.addObject(sceneContainer)
	      
	scene.fog = new THREE.Fog(0x000000, 1, 3000);
	//scene.fog = new THREE.FogExp2( 0x000000, 0.00025*3 );
	//scene.fog = new THREE.FogExp2( 0x87CEEB, 0.00025*3 );
	//scene.fog = new THREE.FogExp2( 0x333, 0.001 );

	// if url?render=canvas then render in canvas
	if( jQuery.url.param('render') == 'canvas' ){
		renderer = new THREE.CanvasRenderer();
	}else{
		renderer = new THREE.WebGLRenderer();
	}
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.sortObjects = false;

	// append the renderer to the DOM
	this._container = document.createElement( 'div' );
	document.body.appendChild( this._container );
	jQuery("#canvasContainer").empty().append( renderer.domElement );

	// append Stats if it is defined
	if( typeof Stats !== "undefined" && WebyMaze.ConfigCli.client.showStat ){
		this._stats = new Stats();
		this._stats.domElement.style.position = 'absolute';
		this._stats.domElement.style.bottom	= '40px';
		this._stats.domElement.style.right	= '0';
		this._stats.domElement.style.zIndex	= 100;
		this._container.appendChild( this._stats.domElement );
	}

	// THREEx.WindowResize will handle renderer/camera reinit on window resize
	new THREEx.WindowResize(renderer, camera);
}


WebyMaze.PageGame.prototype._animate	= function()
{
	this._requestAnimId	= requestAnimationFrame( this._animate.bind(this) );
	// do the rendering
	this._render();
	// update THREEx.TWEEN
	THREEx.TWEEN.update();
}

WebyMaze.PageGame.prototype._render	= function()
{
	renderer.render( scene, camera );
	// update stats
	if( this._stats )	this._stats.update();
}

