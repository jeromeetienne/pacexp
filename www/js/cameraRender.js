/**
 * Render camera
*/

var WebyMaze	= WebyMaze || {};

//////////////////////////////////////////////////////////////////////////////////
//		ctor/dtor							//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.CameraRender	= function(){
	// initialize object variables
	this.state	= null;
	this._transform	= null;
	this._tween	= null;
	
	// init the first state
	this.changeState('fixedGrazing');

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
	if( domEvent.keyCode === "C".charCodeAt(0) ){
		this.cameraNextState();
	}else if( domEvent.keyCode === "V".charCodeAt(0) ){
		this.cameraPrevState();
	}
}

/**
 * tick the camera
*/
WebyMaze.CameraRender.prototype.tick	= function(targetObj3d)
{
	var transform	= this._transform;

	// update camera position
	// TODO this 'camera' is a global... make it a ctor opts
	var angleY	= -targetObj3d.rotation.y;
	camera.position	= {
		x	: targetObj3d.position.x + transform.posX + transform.posA * Math.cos(angleY),
		y	: targetObj3d.position.y + transform.posY,
		z	: targetObj3d.position.z + transform.posZ + transform.posA * Math.sin(angleY)
	};
	camera.target.position	= {
		x	: targetObj3d.position.x + transform.tgtX + transform.tgtA * Math.cos(angleY),
		y	: targetObj3d.position.y + transform.tgtY,
		z	: targetObj3d.position.z + transform.tgtZ + transform.tgtA * Math.sin(angleY)
	};
}

//////////////////////////////////////////////////////////////////////////////////
//		misc								//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.CameraRender.prototype.cameraNextState	= function(){
	var states	= WebyMaze.CameraRender.CameraStates;
	var stateIdx	= states.indexOf(this.state)
	stateIdx	= (stateIdx+1) % states.length;
	this.changeState( states[stateIdx] )
}

WebyMaze.CameraRender.prototype.cameraPrevState	= function(){
	var states	= WebyMaze.CameraRender.CameraStates;
	var stateIdx	= states.indexOf(this.state)
	stateIdx	= (stateIdx-1 + states.length) % states.length;
	this.changeState( states[stateIdx] )
}

WebyMaze.CameraRender.prototype.changeState	= function(state)
{
	console.log("changeState", state);
	// change the current camera state
	// TODO is this usefull ?
	// - is it used elsewhere
	this.state	= state;
	
	// delete this._tween is needed
	if( this._tween ){
		this._tween.stop();
		this._tween	= null;
	}
	
	if( !this._transform ){
		this._transform	= this.transformBuild(this.state);		
	}else{
		// TODO in face the timing will depends on the distance beween the 2
		var t1	= this._transform;
		var t2	= this.transformBuild(this.state);
		console.log("t1", JSON.stringify(t1))
		console.log("t2", JSON.stringify(t2))
		var dx	= Math.abs(t1.posX - t2.posX);
		var dy	= Math.abs(t1.posY - t2.posY);
		var dz	= Math.abs(t1.posZ - t2.posZ);
		var dist= Math.sqrt( dx*dx*dx + dy*dy*dy + dz*dz*dz);
		var spd	= 250/1500;
		var time= dist/spd;
		// TODO the time must NOT linearly proportional
		// - dist go from 13000/ 40000/ 900 
		time	= 1500;
		console.log("tween cam dist", dist)
		this._tween	= new THREEx.TWEEN.Tween(t1).to(t2, time)
					.easing(TWEEN.Easing.Quadratic.EaseInOut)
					//.easing(TWEEN.Easing.Circular.EaseInOut)
					//.easing(TWEEN.Easing.Back.EaseInOut)
					.start();
	}
}

WebyMaze.CameraRender.prototype.changeState0	= function(state)
{
	this.state	= state;
	this._transform	= this.transformBuild(this.state);
}


//////////////////////////////////////////////////////////////////////////////////
//		handle transform						//
//////////////////////////////////////////////////////////////////////////////////

/**
 * return the cameraTransform relative to player position
*/
WebyMaze.CameraRender.prototype.transformBuild	= function(state){
	var transform	= null;
	if( state == "inplayer" ){
		transform	= this.transformInPlayer();
	}else if( state == 'overPlayer' ){
		transform	= this.transformOverPlayer();
	}else if( state == 'fixedGrazing' ){
		transform	= this.transformFixedGrazing();
	}else if( state == 'behindPlayer' ){
		transform	= this.transformBehindPlayer();
	}else if( state == 'zenith' ){
		transform	= this.transformZenith();
	}else if( state == 'facePlayer' ){
		transform	= this.transformFacePlayer();
	}else	console.assert(false);
	// return the transform
	return transform;
}

WebyMaze.CameraRender.prototype.transformBuildRelative	= function(posA, posY, tgtA)
{
	var transform	= {};
	transform.posX	= 0;
	transform.posY	= posY;
	transform.posZ	= 0;
	transform.posA	= posA;
	transform.tgtX	= 0;
	transform.tgtY	= 0;
	transform.tgtZ	= 0;
	transform.tgtA	= tgtA;
	return transform;
}


WebyMaze.CameraRender.prototype.transformInPlayer	= function(targetObj3d)
{
	var deltaBack	= 0;	// TODO if this is != 0, display the player
	var deltaUp	= 50;
	var lookFwd	= 200;
	return this.transformBuildRelative(-deltaBack, deltaUp, lookFwd);
}

WebyMaze.CameraRender.prototype.transformOverPlayer	= function(targetObj3d)
{
	var deltaBack	= 25;	// TODO if this is != 0, display the player
	var deltaUp	= 100;
	var lookFwd	= 200;
	return this.transformBuildRelative(-deltaBack, deltaUp, lookFwd);
}

WebyMaze.CameraRender.prototype.transformBehindPlayer	= function(targetObj3d)
{
	var deltaBack	= 600;
	var deltaUp	= 300;
	var lookFwd	= 200;
	return this.transformBuildRelative(-deltaBack, deltaUp, lookFwd);
}


WebyMaze.CameraRender.prototype.transformFacePlayer	= function(targetObj3d)
{
	var deltaBack	= -200;
	var deltaUp	= 75;
	var lookFwd	= 0;
	return this.transformBuildRelative(-deltaBack, deltaUp, lookFwd);
}

WebyMaze.CameraRender.prototype.transformZenith	= function()
{
	var transform	= {};
	transform.posX	= +0;
	transform.posY	= +1300;
	transform.posZ	= +0;
	transform.posA	= +0;
	transform.tgtX	= +0;
	transform.tgtY	= +0;
	transform.tgtZ	= +0;
	transform.tgtA	= +100;
	return transform;
}

WebyMaze.CameraRender.prototype.transformFixedGrazing	= function()
{
	var transform	= {};
	transform.posX	= +500;
	transform.posY	= +200;
	transform.posZ	= -250;
	transform.posA	= 0;
	transform.tgtX	= +100;
	transform.tgtY	= +0;
	transform.tgtZ	= +0;
	transform.tgtA	= +0;
	return transform;
}
