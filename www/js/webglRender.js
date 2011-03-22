/**
 * TODO webglrender is not the good name for this class
 * - should it be merged with gameCli.js 
*/

var WebyMaze	= WebyMaze || {};

//////////////////////////////////////////////////////////////////////////////////
//		ctor/dtor							//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.WebglRender	= function(opts){
	var ctxInit	= opts.ctxInit		|| console.assert(false);


// TODO put that init else where... like in gameCli init
// update: not so sure... maybe just a poor class name

	this.gameId	= ctxInit.gameId;
	this.username	= ctxInit.username;
	this.urBodyId	= ctxInit.urBodyId;
	this.players	= {};
	this.shoots	= {};

	console.log("ctxInit", ctxInit)
	// init this.mazeCli
	this.mazeCli	= new WebyMaze.MazeCli({
		map	: ctxInit.map
	})
	// update the global scene with this.mazeCli
	sceneContainer.addChild( this.mazeCli.obj3d() );
	
	this.cameraCtor();
	this.usernameUICtor();
	this.gameIdUICtor();
	this.screenshotUICtor();
	this.soundUICtor();
	this.helpUICtor();
}

WebyMaze.WebglRender.prototype.destroy	= function(){
	this.mazeCli.destroy();
}

//////////////////////////////////////////////////////////////////////////////////
//		setCtxTick							//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.WebglRender.prototype.setCtxTick	= function(ctxTick){
	//console.log("ctxTick", ctxTick.players)
	this.setCtxTickPlayer(ctxTick);
	this.setCtxTickShoot(ctxTick);
	if( ctxTick.events.length )
		console.log("event", JSON.stringify(ctxTick.events))
	
	this.cameraTick();
}

/**
 * tick all the players
 *
 * FIXME: setCtxTickShoot and setCtxTickPlayer share the same functions... factorize
*/
WebyMaze.WebglRender.prototype.setCtxTickPlayer	= function(ctxTick){
	var displayMe	= true;
	// handle ctxTick.players
	ctxTick.players.forEach(function(player){
		var bodyId	= player.bodyId;
		// create player if needed
		if( !(bodyId in this.players) ){
			this.players[bodyId]	= new WebyMaze.PlayerCli();
			// add the body to the scene IIF not mine
			if( displayMe || bodyId !== this.urBodyId){
				sceneContainer.addChild( this.players[bodyId].obj3d() );
			}
		}
		// update setCtxTick
		this.players[bodyId].setCtxTick(player)
	}.bind(this));

	// remove the obsolete players
	Object.keys(this.players).forEach(function(bodyId){
		for(var i = 0; i < ctxTick.players.length; i++){
			var player	= ctxTick.players[i];
			if( bodyId === player.bodyId ) return;
		}
		console.log("delete player", bodyId)
		// dont remove this.urBodyId
		if( displayMe || bodyId != this.urBodyId ){
			scene.removeObject( this.players[bodyId].obj3d() );
		}
		this.players[bodyId].destroy();
		delete this.players[bodyId];
	}.bind(this));
}

/**
 * tick all the shoot
 *
*/
WebyMaze.WebglRender.prototype.setCtxTickShoot	= function(ctxTick){
	// handle ctxTick.shoots
	ctxTick.shoots.forEach(function(shoot){
		var bodyId	= shoot.bodyId;
		// create shoot if needed
		if( !(bodyId in this.shoots) ){
			this.shoots[bodyId]	= new WebyMaze.ShootCli();
			// add this object to the scene
			sceneContainer.addChild( this.shoots[bodyId].obj3d() );
		}
		// update setCtxTick
		this.shoots[bodyId].setCtxTick(shoot)
	}.bind(this));
	
	// remove the obsolete shoots
	Object.keys(this.shoots).forEach(function(bodyId){
		for(var i = 0; i < ctxTick.shoots.length; i++){
			var shoot	= ctxTick.shoots[i];
			if( bodyId === shoot.bodyId ) return;
		}
		scene.removeObject( this.shoots[bodyId].obj3d() );
		this.shoots[bodyId].destroy();
		delete this.shoots[bodyId];
	}.bind(this));
}

//////////////////////////////////////////////////////////////////////////////////
//		camera stuff							//
//////////////////////////////////////////////////////////////////////////////////


WebyMaze.WebglRender.prototype.cameraCtor	= function(){
	this.cameraStates	= ['overPlayer', 'inplayer', 'facePlayer', 'zenith', 'behindPlayer'];
	this.cameraState	= this.cameraStates[0];
	this.cameraState	= 'behindPlayer';
	document.addEventListener( 'keydown', function(event){
		//console.log("keydown", event.keyCode)
		switch( event.keyCode ) {
			case 67: /* C */
				var stateIdx	= this.cameraStates.indexOf(this.cameraState)
				stateIdx	= (stateIdx+1) % this.cameraStates.length;
				this.cameraState= this.cameraStates[stateIdx];
				//console.log("camera", this.cameraStates)
				break;
		}
	}.bind(this), false );
}

/**
 * tick the camera
*/
WebyMaze.WebglRender.prototype.cameraTick	= function(){
	//console.log("current cameraState", this.cameraState)
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
	/**
	 * - how to test this ?
	 * - how do i start, i seems to be stuck
	*/


	var transform	= null;
	if( this.cameraState == "inplayer" ){
		transform	= this.cameraInPlayer();
	}else if( this.cameraState == 'overPlayer' ){
		transform	= this.cameraOverPlayer();
	}else if( this.cameraState == 'behindPlayer' ){
		transform	= this.cameraBehindPlayer();
	}else if( this.cameraState == 'zenith' ){
		transform	= this.cameraZenith();
	}else if( this.cameraState == 'facePlayer' ){
		transform	= this.cameraFacePlayer();
	}else	console.assert(false);



	// update camera position
	camera.position		= transform.position;
	camera.target.position	= transform.target;
}

WebyMaze.WebglRender.prototype.cameraInPlayer	= function(){
	var container	= this.players[this.urBodyId].obj3d();
	var transform	= { position: {}, target: {} };
	transform.position.x	= container.position.x;
	transform.position.y	= 0;
	transform.position.z	= container.position.z;
	transform.target.x	= camera.far*Math.cos(-container.rotation.y);
	transform.target.y	= 0;
	transform.target.z	= camera.far*Math.sin(-container.rotation.y);
	return transform;
}

WebyMaze.WebglRender.prototype.cameraOverPlayer	= function(){
	var container	= this.players[this.urBodyId].obj3d();
	var transform	= { position: {}, target: {} };
	var deltaBack	= 25;	// TODO if this is != 0, display the player
	var deltaUp	= 100;
	var lookFwd	= 200;
	var angleY	= -container.rotation.y;
	transform.position.x	= container.position.x - deltaBack*Math.cos(angleY);
	transform.position.y	= +deltaUp;
	transform.position.z	= container.position.z - deltaBack*Math.sin(angleY);
	transform.target.x	= container.position.x + lookFwd*Math.cos(angleY);
	transform.target.y	= 0;
	transform.target.z	= container.position.z + lookFwd*Math.sin(angleY);
	return transform;
}

WebyMaze.WebglRender.prototype.cameraBehindPlayer	= function(){
	var container	= this.players[this.urBodyId].obj3d();
	var transform	= { position: {}, target: {} };
	var deltaBack	= 200;	// TODO if this is != 0, display the player
	var deltaUp	= 100;
	var lookFwd	= 200;
	var angleY	= -container.rotation.y;
	transform.position.x	= container.position.x - deltaBack*Math.cos(angleY);
	transform.position.y	= +deltaUp;
	transform.position.z	= container.position.z - deltaBack*Math.sin(angleY);
	transform.target.x	= container.position.x + lookFwd*Math.cos(angleY);
	transform.target.y	= 0;
	transform.target.z	= container.position.z + lookFwd*Math.sin(angleY);
	return transform;
}


WebyMaze.WebglRender.prototype.cameraFacePlayer	= function(){
	var container	= this.players[this.urBodyId].obj3d();
	var transform	= { position: {}, target: {} };
	var deltaBack	= -200;	// TODO if this is != 0, display the player
	var deltaUp	= 75;
	var lookFwd	= 0;
	var angleY	= -container.rotation.y + Math.PI;
// TODO: port this to be the usual formula. only change parameters
	transform.position.x	= container.position.x + deltaBack*Math.cos(angleY);
	transform.position.y	= +deltaUp;
	transform.position.z	= container.position.z + deltaBack*Math.sin(angleY);
	transform.target.x	= container.position.x + lookFwd*Math.cos(angleY);
	transform.target.y	= 0;
	transform.target.z	= container.position.z + lookFwd*Math.sin(angleY);
	return transform;
}

WebyMaze.WebglRender.prototype.cameraZenith	= function(){
	var container	= this.players[this.urBodyId].obj3d();
	var transform	= { position: {}, target: {} };
	transform.position.x	= container.position.x;
	transform.position.y	= +1300;
	transform.position.z	= container.position.z;
	transform.target.x	= container.position.x;
	transform.target.y	= 0;
	transform.target.z	= container.position.z;
	return transform;
}

//////////////////////////////////////////////////////////////////////////////////
//		UsernameUI stuff						//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.WebglRender.prototype.usernameUICtor	= function(){
	var inputSel	= '#UsernameDialog input[name=username]';
	var dialogSel	= '#UsernameDialog';
	var buttonSel	= '#UsernameButton';
	
	// init dialogs
	jQuery(dialogSel).jqm();
	
	var onClose	= function(){
		// get the value from the element
		var username	= jQuery(inputSel).val();
		// if the value is empty, ignore it
		if( username.length == 0 )		return;
		// if the value is same as before, ignore it
		if( username.length == this.username )	return;
		// notify the server
		gameCli.socketSend({
			type	: "changeUsername",
			data	: username
		});
		// update local var
		this.username	= username;
		// update document.title
		document.title	= username+" having fun with pacmaze experiment!!";
		// put the value in the button label
		jQuery(buttonSel+" span.value").text(username)
		// change the gameConfig
		gameConfig.username(username);
	}.bind(this);

	// to detect when the window is closed
	jQuery(inputSel).blur(function(event){
		onClose();
	}.bind(this))
	
	// to detect when enter is pressed, the window is closed
	jQuery(inputSel).bind('keypress', function(event){
		console.log("keycode", event.keyCode);
		if( event.keyCode == 13 ){
			jQuery(dialogSel).jqmHide(); 
			onClose();
		}
	}.bind(this));
	
	// put the value in the button label
	jQuery(buttonSel+" span.value").text(this.username)

	jQuery(buttonSel).click(function(){
		this.cameraState= 'facePlayer';
		jQuery(inputSel).val(this.username)
		jQuery(dialogSel).jqmShow(); 
	}.bind(this));
}

WebyMaze.WebglRender.prototype.gameIdUICtor	= function(){
	var inputSel	= '#GameIdDialog input[name=gameId]';
	var dialogSel	= '#GameIdDialog';
	var buttonSel	= '#GameIdButton';
	
	// init dialogs
	jQuery(dialogSel).jqm();
	
	var onClose	= function(){
		// get the value from the element
		var gameId	= jQuery(inputSel).val();
		// if the value is empty, ignore it
		if( gameId.length == 0 )	return;
		// if the value is same as before, ignore it
		if( gameId == this.gameId )	return;
		// put the value in the button label
		jQuery(buttonSel+" span.value").text(gameId)
		// update page title
		jQuery('.pagetitle a').href("http://pacmaze.com/#"+gameId)
		// change the gameConfig
		gameConfig.gameId(gameId);		
		// reload the page to init new game...
		// FIXME this is dirty
		window.location.reload();
	}.bind(this);

	// to detect when the window is closed
	jQuery(inputSel).blur(function(event){
		onClose();
	}.bind(this))
	
	// to detect when enter is pressed, the window is closed
	jQuery(inputSel).bind('keypress', function(event){
		console.log("keycode", event.keyCode);
		if( event.keyCode == 13 ){
			jQuery(dialogSel).jqmHide(); 
			onClose();
		}
	}.bind(this));

	// put the value in the button label
	jQuery(buttonSel+" span.value").text(this.gameId)
	// update page title
	jQuery('.pagetitle a').attr('href', "http://pacmaze.com/#"+this.gameId)

	// bind the click on the button
	jQuery(buttonSel).click(function(){
		jQuery(inputSel).val(this.gameId)
		jQuery(dialogSel).jqmShow(); 
	}.bind(this));
}

WebyMaze.WebglRender.prototype.screenshotUICtor	= function(){
	var buttonSel	= '#ScreenshotButton';

	jQuery(buttonSel).click(function(){
		var dataUrl	= renderer.domElement.toDataURL("image/png");
		// FIXME: toDataUrl doesnt display everything... e.g. fog isnt on the image
		// - additionnaly this is only about the canvas, not all the OSD on top
		// - maybe to use another technic to get screenshot of the viewport... chrome specific
		console.dir(renderer.domElement.toDataURL("image/png"));
		//jQuery("<img>").attr('src',dataUrl).appendTo("body")
		
		//jQuery.post('http://127.0.0.1:8081/upload', {dataUrl: dataUrl}, function(data) {
		//	console.log("slota", data)
		//});
		// TODO to code... not done server side
	}.bind(this));	
}

WebyMaze.WebglRender.prototype.helpUICtor	= function(){
	var dialogSel	= '#inlineHelpDialog';
	var buttonSel	= '#inlineHelpButton';

	// init dialogs
	jQuery(dialogSel).jqm();
	// init the button click
	jQuery(buttonSel).click(function(){
		jQuery(dialogSel).jqmShow(); 
	}.bind(this));
	
	// to make it appear on load
	//jQuery(dialogSel).jqmShow();
}


WebyMaze.WebglRender.prototype.soundUICtor	= function(){
	var buttonSel	= '#soundButton';
	// init the button click
	jQuery(buttonSel).click(function(){
		var running	= soundRender.soundTrackRunning();
		console.log("running", soundRender.soundTrackRunning())
		if( running === false ){
			soundRender.soundTrackStart();
		}else{
			soundRender.soundTrackStop();
		}
		jQuery(buttonSel).text('Sound '+ (running ? 'Off' : 'On'));
		gameConfig.sound(running ? false : true);
		console.log("post running", soundRender.soundTrackRunning())
	}.bind(this));
}
