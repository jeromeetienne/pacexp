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
	if( !Detector.webgl ){
		alert('WebGL not supported by your browser');
		return;
	}
	document.addEventListener( 'mousemove', onDocumentMouseMove, false );	
	soundRender	= new WebyMaze.SoundRender();
	gameCli		= new WebyMaze.GameCli();
	gameConfig	= new WebyMaze.Config();
	init();
	animate();
}

function init() {

	container = document.createElement( 'div' );
	document.body.appendChild( container );

	camera = new THREE.Camera(60, window.innerWidth / window.innerHeight, 1, 2800 );

	scene = new THREE.Scene();
	sceneContainer = new THREE.Object3D();
	scene.addObject(sceneContainer)

	scene.fog = new THREE.Fog(0x000000, 1, 3000);
	//scene.fog = new THREE.FogExp2( 0x000000, 0.00025*3 );
	//scene.fog = new THREE.FogExp2( 0x87CEEB, 0.00025*3 );
	//scene.fog = new THREE.FogExp2( 0xefd1b5, 0.0025 );

	//scene.addObject( wmMaze.buildObject3d() );
	//
	//scene.addObject( wmPlayer.buildObject3d() );
	
	scene.addLight( new THREE.AmbientLight( 0xAAAAAA ) );

	var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.8 );
	directionalLight.position.x = -0.36;
	directionalLight.position.y = 0.3;
	directionalLight.position.z = 0.7;
	directionalLight.position.normalize();
	scene.addLight( directionalLight );
	
	renderer = new THREE.WebGLRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.sortObjects = false;
	container.appendChild( renderer.domElement );

	if( typeof Stats !== "undefined" ){
		stats = new Stats();
		stats.domElement.style.position = 'absolute';
		stats.domElement.style.bottom	= '40px';
		stats.domElement.style.right	= '0';
		stats.domElement.style.zIndex	= 100;
		container.appendChild( stats.domElement );		
	}

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
	if( stats )	stats.update();
}

function render() {
	renderer.render( scene, camera );
}

