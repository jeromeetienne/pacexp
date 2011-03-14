var container, stats;

var camera, scene, renderer;

var mouseX = 0, mouseY = 0;

var windowHalfX = window.innerWidth / 2;
var windowHalfY	= window.innerHeight / 2;

document.addEventListener( 'mousemove', onDocumentMouseMove, false );

//var move	= new WebyMaze.KeyboardMove();
var soundRender	= new WebyMaze.SoundRender();
//var wmMaze	= new WebyMaze.MazeCli();
//var wmPlayer	= new WebyMaze.PlayerCli();
//var wmSocket	= new WebyMaze.Socket();

var gameCli	= new WebyMaze.GameCli();


init();
animate();

function init() {

	container = document.createElement( 'div' );
	document.body.appendChild( container );

	camera = new THREE.Camera( 60/3, window.innerWidth / window.innerHeight, 1, 10000 );
	//camera = new THREE.QuakeCamera( { fov: 60, aspect: window.innerWidth / window.innerHeight, near: 1, far: 10000,
	//	movementSpeed: 5, lookSpeed: 0.004, noFly: false, lookVertical: true } );

	camera.position.x = 0;
	camera.position.y = 0;
	camera.position.z = 5000;

	scene = new THREE.Scene();
	scene.fog = new THREE.Fog( 0xffffff, 1, 10000 );
	//scene.fog = new THREE.FogExp2( 0xffffff, 0.00025 );
	//scene.fog = new THREE.FogExp2( 0xefd1b5, 0.0025 );

	//scene.addObject( wmMaze.buildObject3d() );
	//
	//scene.addObject( wmPlayer.buildObject3d() );

	//scene.addLight( new THREE.AmbientLight( 0x202020 ) );

	var directionalLight = new THREE.DirectionalLight( 0xffffff );
	directionalLight.position.x = -0.36;
	directionalLight.position.y = 0.6;
	directionalLight.position.z = 0.7;
	directionalLight.position.normalize();
	scene.addLight( directionalLight );
	
	renderer = new THREE.WebGLRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.sortObjects = false;
	container.appendChild( renderer.domElement );

	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.top = '0px';
	stats.domElement.style.zIndex = 100;
	container.appendChild( stats.domElement );

}
var clientX = null;
var clientY = null;
function onDocumentMouseMove(event) {
clientX	= event.clientX;
clientY	= event.clientY;
	mouseX = ( event.clientX - windowHalfX ) * 10;
	mouseY = ( event.clientY - windowHalfY ) * 10;
}


function animate() {
	requestAnimationFrame( animate );
	render();
	stats.update();
}

function render() {

	//camera.position.x += ( mouseX - camera.position.x ) * .05;
	//camera.position.y += ( - mouseY - camera.position.y ) * .05;

	//camera.position.x = 0;
	//camera.position.y = 1300;
	//camera.position.z = 300;

	//camera.position.x = clientY*3;
	//camera.position.y = 1300+clientX*3;
	//console.log("y", camera.position.y)
	
	
	if( false ){
		if( move.moveForward )	wmPlayer.moveForward();
		if( move.moveBackward )	wmPlayer.moveBackward();
		if( move.moveLeft )	wmPlayer.moveLeft();
		if( move.moveRight )	wmPlayer.moveRight();
		
		var collided	= wmPlayer.collideMaze(wmMaze)
		if( collided )	soundRender.play('wallImpact');		
	}

	renderer.render( scene, camera );
}
