/**
 * Render camera
*/

var WebyMaze	= WebyMaze || {};

//////////////////////////////////////////////////////////////////////////////////
//		ctor/dtor							//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.CameraRender	= function(){
	this.state	= 'behindPlayer';

	// bind the cameraSwitch keys
	this.$keydownCallback	= this.onKeyDown.bind(this)
	document.addEventListener( 'keydown', this.$keydownCallback, false);
}

WebyMaze.CameraRender.prototype.destroy	= function()
{
	// unbind the cameraSwitch keys
	document.removeEventListener( 'keydown', this.$keydownCallback, false);
}

/**
 * Define all possible cameraStates
*/
WebyMaze.CameraRender.CameraStates	= ['overPlayer', 'inplayer', 'facePlayer', 'zenith', 'behindPlayer', 'fixedGrazing'];

//////////////////////////////////////////////////////////////////////////////////
//		handle tick							//
//////////////////////////////////////////////////////////////////////////////////


WebyMaze.CameraRender.prototype.onKeyDown	= function(domEvent)
{
	//console.log("keydown", event.keyCode)
	if( event.keyCode === "C".charCodeAt(0) ){
		this.cameraNextState();
	}else if( event.keyCode === "V".charCodeAt(0) ){
		this.cameraPrevState();
	}
}

/**
 * tick the camera
*/
WebyMaze.CameraRender.prototype.tick	= function(targetObj3d){
	//console.log("current state", this.state)
	// TODO handle the camera position by state.  "inperson" "aboveandbehind" "zenith"
	// - smooth easing later ? just one position/rotation to another
	// - from one position/rotation to another... super flexible... with tunable tween.js

	/**
	 * Note on camera
	 *
	 * - express all positions in Delta
	 *   - according to the player position
	 *   - camera.position = player.position + delta.position
	 *   - camera.target.position = player.position + delta.target
	 * - the tweening occurs at this level
	*/

// TODO
// - factorize all function using this
// - put that in WebyMaze.Camera class

	/**
	 * - how to test this ?
	 * - how do i start, i seems to be stuck
	*/
	
	var transform	= this.transformBuild(this.state, targetObj3d);

	// update camera position
	// TODO this 'camera' is a global... make it a ctor opts
	camera.position	= {
		x	: targetObj3d.position.x	+ transform.positionX,
		y	: targetObj3d.position.y	+ transform.positionY,
		z	: targetObj3d.position.z	+ transform.positionZ
	};
	camera.target.position	= {
		x	: targetObj3d.position.x	+ transform.targetX,
		y	: targetObj3d.position.y	+ transform.targetY,
		z	: targetObj3d.position.z	+ transform.targetZ
	};
}

//////////////////////////////////////////////////////////////////////////////////
//		misc								//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.CameraRender.prototype.cameraNextState	= function(){
	var states	= WebyMaze.CameraRender.CameraStates;
	var stateIdx	= states.indexOf(this.state)
	stateIdx	= (stateIdx+1) % states.length;
	this.state	= states[stateIdx];
}

WebyMaze.CameraRender.prototype.cameraPrevState	= function(){
	var states	= WebyMaze.CameraRender.CameraStates;
	var stateIdx	= states.indexOf(this.state)
	stateIdx	= (stateIdx-1 + states.length) % states.length;
	this.state	= states[stateIdx];
}

//////////////////////////////////////////////////////////////////////////////////
//		handle transform						//
//////////////////////////////////////////////////////////////////////////////////

/**
 * return the cameraTransform relative to player position
*/
WebyMaze.CameraRender.prototype.transformBuild	= function(state, targetObj3d){
	var transform	= null;
	if( state == "inplayer" ){
		transform	= this.transformInPlayer(targetObj3d);
	}else if( state == 'overPlayer' ){
		transform	= this.transformOverPlayer(targetObj3d);
	}else if( state == 'fixedGrazing' ){
		transform	= this.transformFixedGrazing(targetObj3d);
	}else if( state == 'behindPlayer' ){
		transform	= this.transformBehindPlayer(targetObj3d);
	}else if( state == 'zenith' ){
		transform	= this.transformZenith(targetObj3d);
	}else if( state == 'facePlayer' ){
		transform	= this.transformFacePlayer(targetObj3d);
	}else	console.assert(false);
	// return the transform
	return transform;
}

WebyMaze.CameraRender.prototype.transformInPlayer	= function(targetObj3d){
	var transform	= {};
	var deltaBack	= 0;	// TODO if this is != 0, display the player
	var deltaUp	= 0;
	var lookFwd	= 200;
	var angleY	= -targetObj3d.rotation.y;
	transform.positionX	= - deltaBack*Math.cos(angleY);
	transform.positionY	= + deltaUp;
	transform.positionZ	= - deltaBack*Math.sin(angleY);
	transform.targetX	= + lookFwd*Math.cos(angleY);
	transform.targetY	= + 0;
	transform.targetZ	= + lookFwd*Math.sin(angleY);
	return transform;
}


WebyMaze.CameraRender.prototype.transformOverPlayer	= function(targetObj3d){
	var transform	= {};
	var deltaBack	= 25;	// TODO if this is != 0, display the player
	var deltaUp	= 100;
	var lookFwd	= 200;
	var angleY	= -targetObj3d.rotation.y;
	transform.positionX	= - deltaBack*Math.cos(angleY);
	transform.positionY	= + deltaUp;
	transform.positionZ	= - deltaBack*Math.sin(angleY);
	transform.targetX	= + lookFwd*Math.cos(angleY);
	transform.targetY	= + 0;
	transform.targetZ	= + lookFwd*Math.sin(angleY);
	return transform;
}

WebyMaze.CameraRender.prototype.transformBehindPlayer	= function(targetObj3d){
	var transform	= {};
	var deltaBack	= 200;
	var deltaUp	= 100;
	var lookFwd	= 200;
	var angleY	= -targetObj3d.rotation.y;
	transform.positionX	= - deltaBack*Math.cos(angleY);
	transform.positionY	= + deltaUp;
	transform.positionZ	= - deltaBack*Math.sin(angleY);
	transform.targetX	= + lookFwd*Math.cos(angleY);
	transform.targetY	= + 0;
	transform.targetZ	= + lookFwd*Math.sin(angleY);
	return transform;
}


WebyMaze.CameraRender.prototype.transformFacePlayer	= function(targetObj3d){
	var transform	= {};
	var deltaBack	= -200;	// TODO if this is != 0, display the player
	var deltaUp	= 75;
	var lookFwd	= 0;
	var angleY	= -targetObj3d.rotation.y + Math.PI;
	transform.positionX	= + deltaBack*Math.cos(angleY);
	transform.positionY	= + deltaUp;
	transform.positionZ	= + deltaBack*Math.sin(angleY);
	transform.targetX	= + lookFwd*Math.cos(angleY);
	transform.targetY	= 0;
	transform.targetZ	= + lookFwd*Math.sin(angleY);
	return transform;
}

WebyMaze.CameraRender.prototype.transformZenith	= function(targetObj3d){
	var transform	= {};
	transform.positionX	= 0;
	transform.positionY	= +1300;
	transform.positionZ	= 0;
	transform.targetX	= 0;
	transform.targetY	= 0;
	transform.targetZ	= 0;
	return transform;
}

WebyMaze.CameraRender.prototype.transformFixedGrazing	= function(targetObj3d){
	var transform	= {};
	transform.positionX	= +500;
	transform.positionY	= +400;
	transform.positionZ	= -250;
	transform.targetX	= +100;
	transform.targetY	= +0;
	transform.targetZ	= +0;
	return transform;
}
