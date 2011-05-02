/**
 * Global var... to remove
*/
var container, stats;

var camera, scene, renderer;

var sceneContainer;

var mouseX = 0, mouseY = 0;

var clientX	= null;
var clientY	= null;

var windowHalfX = window.innerWidth / 2;
var windowHalfY	= window.innerHeight / 2;

var soundRender	= null;
var gameCli	= null;
var gameConfig	= null;

var main	= function(){
	// TODO put back detector
	try {
		var webGlSupport	= !!window.WebGLRenderingContext && !!document.createElement('canvas').getContext('experimental-webgl');
	}catch(e){
		var webGlSupport	= false;
	}
	var webGlNeeded	= jQuery.url.param('render') !== 'canvas';
	var webGlDisable= jQuery.url.param('webGlDisable') ? parseInt(jQuery.url.param('webGlDisable')) : false;
	if( webGlDisable )	webGlSupport	= false;
	if( webGlNeeded && !webGlSupport ){
		jQuery('#noWebGLDialog').jqm();
		jQuery('#noWebGLDialog').jqmShow(); 		
		return;
	}
	document.addEventListener( 'mousemove', onDocumentMouseMove, false );	
	gameCli		= new WebyMaze.GameCli();
	gameConfig	= new WebyMaze.Config();
	soundRender	= new WebyMaze.SoundRender({
		enableTrack	: gameConfig.soundTrack() === "true",
		enableFx	: gameConfig.soundFx() === "true"
	});
	init();
	animate();
}

function init()
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

	//scene.addLight( new THREE.AmbientLight( 0xAAAAAA ) );
	scene.addLight( new THREE.AmbientLight( 0x222222 ) );

	//
	var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.8 );
	directionalLight.position.x = -0;
	directionalLight.position.y = 0.3;
	directionalLight.position.z = 0.7;
	directionalLight.position.normalize();
	scene.addLight( directionalLight );

	// add a pointLight to experiment with it
	//var pointLight1	= new THREE.PointLight( 0xaa44aa, 10, 1500 );
	//scene.addLight( pointLight1 );	
	//pointLight1.position.x = 0;
	//pointLight1.position.y = 1000;
	//pointLight1.position.z = 0;

	//// add a pointLight to experiment with it
	//var pointLight2	= new THREE.PointLight( 0x44FF44, 10, 1500 );
	//scene.addLight( pointLight2 );	
	//pointLight2.position.x = 11*100;
	//pointLight2.position.y = 1000;
	//pointLight2.position.z = 11*100;

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

function onDocumentMouseMove(event) {
clientX	= event.clientX;
clientY	= event.clientY;
	mouseX = event.clientX - windowHalfX;
	mouseY = event.clientY - windowHalfY;
}


function animate() {
	requestAnimationFrame( animate );
	render();
	THREEx.TWEEN.update();
	if( stats )	stats.update();
}

function render() {
	renderer.render( scene, camera );
}

