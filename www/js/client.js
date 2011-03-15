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

main	= function(){
	main3d();	return;
	var twitterName	= "jerome_etienne";
	if( location.hash ) twitterName = location.hash.substring(1)
	console.log(twitterName)

	var apiUrl	= 'http://twitter.com/users/'+twitterName+'.json?callback=?';
	jQuery.getJSON(apiUrl, function(data){
		var imgUrl	= data.profile_image_url;
		var element	= jQuery("<img>").attr('src', imgUrl);
		
		jQuery('#avatar').replaceWith(element);
		jQuery(element).bind('load', function(){
			console.log("avatar loaded")
			//main3d();
		})
	})
}


main3d	= function(){	
	document.addEventListener( 'mousemove', onDocumentMouseMove, false );	
	soundRender	= new WebyMaze.SoundRender();
	gameCli		= new WebyMaze.GameCli();
	init();
	animate();
}

function init() {

	container = document.createElement( 'div' );
	document.body.appendChild( container );

	if( true ){
		camera = new THREE.Camera( 60/3, window.innerWidth / window.innerHeight, 1, 100000 );
		camera.position.x = 0;
		camera.position.y = 0;
		camera.position.z = 4000;
	//console.log("camera")
	//console.dir(camera)
	}else{
		camera = new THREE.QuakeCamera( { fov: 60, aspect: window.innerWidth / window.innerHeight, near: 1, far: 10000,
			movementSpeed: 5, lookSpeed: 0.004, noFly: false, lookVertical: true } );		
		camera.position.x = 0;
		camera.position.y = 0;
		camera.position.z = 4000;
	}


	scene = new THREE.Scene();
console.log("scene", scene);

	sceneContainer = new THREE.Object3D();
	scene.addObject(sceneContainer)

	//scene.fog = new THREE.Fog( 0xffffff, 1, 10000 );
	//scene.fog = new THREE.FogExp2( 0xffffff, 0.00025 );
	//scene.fog = new THREE.FogExp2( 0xefd1b5, 0.0025 );

	//scene.addObject( wmMaze.buildObject3d() );
	//
	//scene.addObject( wmPlayer.buildObject3d() );
	
	scene.addLight( new THREE.AmbientLight( 0x550000 ) );

	var directionalLight = new THREE.DirectionalLight( 0xffffff );
	directionalLight.position.x = -0.36;
	directionalLight.position.y = 0.3;
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
	renderer.render( scene, camera );
}

