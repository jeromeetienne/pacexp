/**
 * Render camera
*/

var WebyMaze	= WebyMaze || {};

//////////////////////////////////////////////////////////////////////////////////
//		ctor/dtor							//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.CameraRender	= function()
{
	// initialize object variables
	this.state	= null;
	this._transform	= null;
	this._tween	= null;
	
	this.state	= null;
	

	// read the game config
	this._config	= WebyMaze.ConfigCli.cameraRender;
	
	// bind the cameraSwitch keys
	this._$keydownCallback	= this._onKeyDown.bind(this)
	document.addEventListener( 'keydown', this._$keydownCallback, false);
}

WebyMaze.CameraRender.prototype.destroy	= function()
{
	// unbind the cameraSwitch keys
	document.removeEventListener( 'keydown', this._$keydownCallback, false);
}

// mixin MicroEvent 
MicroEvent.mixin(WebyMaze.CameraRender);

/**
 * Define all possible cameraStates
*/
//WebyMaze.CameraRender.CameraStates	= ['overPlayer', 'inplayer', 'facePlayer', 'zenith',
//					'behindPlayer', 'fixedZenith', 'fixedGrazing'];
WebyMaze.CameraRender.CameraStates	= WebyMaze.ConfigCli.cameraRender.cameraStates;

WebyMaze.CameraRender.State2RotationType= {
	'overPlayer'	: "relative",
	'inplayer'	: "relative",
	'facePlayer'	: "relative",
	'zenith'	: "relative",
	'behindPlayer'	: "relative",
	'fixedZenith'	: "absolute",
	'fixedGrazing'	: "absolute"
};


//////////////////////////////////////////////////////////////////////////////////
//		handle tick							//
//////////////////////////////////////////////////////////////////////////////////


WebyMaze.CameraRender.prototype._onKeyDown	= function(domEvent)
{
	var pageUp	= 33;
	var pageDown	= 34;
	//console.log("keydown", event.keyCode)
	if( domEvent.keyCode === "C".charCodeAt(0) || domEvent.keyCode == pageDown ){
		this.cameraNextState();
	}else if( domEvent.keyCode === "V".charCodeAt(0) || domEvent.keyCode == pageUp ){
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

WebyMaze.CameraRender.prototype.getState	= function()
{
	return this.state;
}


WebyMaze.CameraRender.prototype.changeState	= function(state)
{
	// save the old State
	var oldState	= this.state;
	// log to debug
	console.log("changeState", state);
	// change the current camera state
	this.state	= state;
	
	// delete this._tween is needed
	if( this._tween ){
		this._tween.stop();
		this._tween	= null;
	}
	
	if( !this._transform ){
		this._transform	= this._transformBuild(this.state);		
	}else{
		// TODO in face the timing will depends on the distance beween the 2
		var t1	= this._transform;
		var t2	= this._transformBuild(this.state);
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
		time	= 1000;	// TODO tune it at 1000 for buddymaze
		time	= this._config.tweenDelay;
		console.log("tween cam dist", dist)
		this._tween	= new THREEx.TWEEN.Tween(t1).to(t2, time)
					.easing(TWEEN.Easing.Quadratic.EaseInOut)
					//.easing(TWEEN.Easing.Circular.EaseInOut)
					//.easing(TWEEN.Easing.Back.EaseInOut)
					.start();
	}
	// tigger the event
	this.trigger('stateChange', this.state, oldState);
}

//////////////////////////////////////////////////////////////////////////////////
//		handle transform						//
//////////////////////////////////////////////////////////////////////////////////

/**
 * return the cameraTransform relative to player position
*/
WebyMaze.CameraRender.prototype._transformBuild	= function(state){
	var transform	= null;
	if( state == "inplayer" ){
		transform	= this._transformInPlayer();
	}else if( state == 'overPlayer' ){
		transform	= this._transformOverPlayer();
	}else if( state == 'fixedZenith' ){
		transform	= this._transformFixedZenith();
	}else if( state == 'fixedGrazing' ){
		transform	= this._transformFixedGrazing();
	}else if( state == 'behindPlayer' ){
		transform	= this._transformBehindPlayer();
	}else if( state == 'zenith' ){
		transform	= this._transformZenith();
	}else if( state == 'facePlayer' ){
		transform	= this._transformFacePlayer();
	}else	console.assert(false);
	// return the transform
	return transform;
}

WebyMaze.CameraRender.prototype._transformBuildRelative	= function(posA, posY, tgtA)
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


WebyMaze.CameraRender.prototype._transformInPlayer	= function(targetObj3d)
{
	var deltaBack	= 0;	// TODO if this is != 0, display the player
	var deltaUp	= 20;
	var lookFwd	= 200;
	return this._transformBuildRelative(-deltaBack, deltaUp, lookFwd);
}

WebyMaze.CameraRender.prototype._transformOverPlayer	= function(targetObj3d)
{
	var deltaBack	= 25;	// TODO if this is != 0, display the player
	var deltaUp	= 75;
	var lookFwd	= 200;
	return this._transformBuildRelative(-deltaBack, deltaUp, lookFwd);
}

WebyMaze.CameraRender.prototype._transformBehindPlayer	= function(targetObj3d)
{
	var deltaBack	= 500;
	var deltaUp	= 300;
	var lookFwd	= 200;
	return this._transformBuildRelative(-deltaBack, deltaUp, lookFwd);
}


WebyMaze.CameraRender.prototype._transformFacePlayer	= function(targetObj3d)
{
	var deltaBack	= -200;
	var deltaUp	= 75;
	var lookFwd	= 0;
	return this._transformBuildRelative(-deltaBack, deltaUp, lookFwd);
}

WebyMaze.CameraRender.prototype._transformZenith	= function()
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

WebyMaze.CameraRender.prototype._transformFixedZenith	= function()
{
	var transform	= {};

	transform.posX	= +50;
	transform.posY	= +800;
	transform.posZ	= -0;
	transform.posA	=  0;

	transform.tgtX	= +0;
	transform.tgtY	= +0;
	transform.tgtZ	= +0;
	transform.tgtA	= +0;

	return transform;
}

WebyMaze.CameraRender.prototype._transformFixedGrazing	= function()
{
	var transform	= {};
	transform.posX	= +500;
	transform.posY	= +150;
	transform.posZ	= -250;
	transform.posA	= 0;
	transform.tgtX	= +100;
	transform.tgtY	= +0;
	transform.tgtZ	= +0;
	transform.tgtA	= +0;
	return transform;
}
