/**
 * TODO Global var... to remove
*/
var container, stats;

var camera, scene, renderer;

var sceneContainer;

var soundRender	= null;
var gameCli	= null;
var gameConfig	= null;

//////////////////////////////////////////////////////////////////////////////////
//		ctor/dtor							//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.PageGame	= function()
{
	jQuery("#gamePageContainer").show();
	
	gameCli		= new WebyMaze.GameCli();
	gameConfig	= new WebyMaze.ConfigStore();
	soundRender	= new WebyMaze.SoundRender({
		enableTrack	: gameConfig.soundTrack() === "true",
		enableFx	: gameConfig.soundFx() === "true"
	});
	this._init();
	animate();	
}

WebyMaze.PageGame.prototype.destroy	= function()
{
}

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
	container = document.createElement( 'div' );
	document.body.appendChild( container );
	jQuery("#canvasContainer").empty().append( renderer.domElement );

	// append Stats if it is defined
	if( typeof Stats !== "undefined" && WebyMaze.ConfigCli.client.showStat ){
		stats = new Stats();
		stats.domElement.style.position = 'absolute';
		stats.domElement.style.bottom	= '40px';
		stats.domElement.style.right	= '0';
		stats.domElement.style.zIndex	= 100;
		container.appendChild( stats.domElement );
	}

	// THREEx.WindowResize will handle renderer/camera reinit on window resize
	new THREEx.WindowResize(renderer, camera);
}



function animate() {
	requestAnimationFrame( animate );
	// do the rendering
	render();
	// update THREEx.TWEEN
	THREEx.TWEEN.update();
	// update stats
	if( stats )	stats.update();
}

function render() {
	renderer.render( scene, camera );
}

