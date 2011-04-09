/**
 * TODO webglrender is not the good name for this class
 * - should it be merged with gameCli.js 
*/

/** @namespace */
var WebyMaze	= WebyMaze || {};

//////////////////////////////////////////////////////////////////////////////////
//		ctor/dtor							//
//////////////////////////////////////////////////////////////////////////////////

/**
 * Renderer for webgl
 * 
 * @constructor
*/
WebyMaze.WebglRender	= function(opts){
	var ctxInit	= opts.ctxInit		|| console.assert(false);


// TODO put that init else where... like in gameCli init
// update: not so sure... maybe just a poor class name

	this.gameId	= ctxInit.gameId;
	this.username	= ctxInit.username;
	this.urBodyId	= ctxInit.urBodyId;
	this.players	= {};
	this.enemies	= {};
	this.shoots	= {};
	this.pills	= {};

	console.log("ctxInit", ctxInit)
	// init this.mazeCli
	this.mazeCli	= new WebyMaze.MazeCli({
		map	: ctxInit.map
	})
	// update the global scene with this.mazeCli
	sceneContainer.addChild( this.mazeCli.obj3d() );
	
	this.cameraRender	= new WebyMaze.CameraRender();

	// TODO put the whole UI stuff in its own class (like camera)
	this.usernameUICtor();
	this.gameIdUICtor();
	this.screenshotUICtor();
	this.soundTrackUiCtor();
	this.soundFxUiCtor();
	this.helpUICtor();

	if( ctxInit.renderInfoFull ){
		this.setCtxTickPlayer(ctxInit.renderInfoFull);
		this.setCtxTickEnemy(ctxInit.renderInfoFull);
		this.setCtxTickShoot(ctxInit.renderInfoFull);
		this.setCtxTickPill(ctxInit.renderInfoFull);
	}
}

/**
 * destructor
*/
WebyMaze.WebglRender.prototype.destroy	= function(){
	this.mazeCli.destroy();
}

//////////////////////////////////////////////////////////////////////////////////
//		setCtxTick							//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.WebglRender.prototype.setCtxTick	= function(ctxTick){
	//console.log("ctxTick", ctxTick)
	this.setCtxTickPlayer(ctxTick);
	this.setCtxTickEnemy(ctxTick);
	this.setCtxTickShoot(ctxTick);
	this.setCtxTickPill(ctxTick);
	
	this.tickEventHandler(ctxTick.events)

	// handle the .obj3d() update for enemy
	Object.keys(this.enemies).forEach(function(enemyId){
		var enemy	= this.enemies[enemyId];
		if( enemy._dirtyObj3d !== true )	return;
		sceneContainer.addChild( enemy.obj3d() );
		enemy._dirtyObj3d	= false;
	}.bind(this));
	
	// handle the scoreUiUpdate
	if( this.players[this.urBodyId].dirtyScore ){
		this.scoreUIUpdate();
		this.players[this.urBodyId].dirtyScore    = false;
	}	
	
	var targetObject3d	= this.players[this.urBodyId].obj3d()
	this.cameraRender.tick(targetObject3d);
}


/**
 * Update RenderInfo for shoots
*/
WebyMaze.WebglRender.prototype.setCtxTickPlayer	= function(ctxTick)
{
	this._renderInfoPatch(ctxTick.players, this.players, WebyMaze.PlayerCli);
}

/**
 * Update RenderInfo for shoots
*/
WebyMaze.WebglRender.prototype.setCtxTickEnemy	= function(ctxTick)
{
	this._renderInfoPatch(ctxTick.enemies, this.enemies, WebyMaze.EnemyCli);
}

/**
 * Update RenderInfo for shoots
*/
WebyMaze.WebglRender.prototype.setCtxTickShoot	= function(ctxTick)
{
	this._renderInfoPatch(ctxTick.shoots, this.shoots, WebyMaze.ShootCli);
}


/**
 * Update RenderInfo for pills
*/
WebyMaze.WebglRender.prototype.setCtxTickPill	= function(ctxTick)
{
	this._renderInfoPatch(ctxTick.pills, this.pills, WebyMaze.PillCli);
}


/**
 * patch local instances based on renderInfo
 *
 * @param {object} renderInfo the renderInfo sent from the server
 * @param {object} collection store all objects locally instanced from renderInfo
 * @param {Class} classCtor the constructor to build a new instance
*/
WebyMaze.WebglRender.prototype._renderInfoPatch	= function(renderInfo, collection, classCtor)
{
	if( ! renderInfo )	return;
	//if( Object.keys(renderInfo).length )	console.log("renderInfo", renderInfo)
	
	if( 'add' in renderInfo ){
		Object.keys(renderInfo.add).forEach(function(bodyId){
			var ctx	= renderInfo.add[bodyId];
			console.assert( !(bodyId in collection) )
			collection[bodyId]	= new classCtor();
			collection[bodyId].setCtxTick(ctx)
			sceneContainer.addChild( collection[bodyId].obj3d() );
		}.bind(this))
	}
	
	if( 'upd' in renderInfo ){
		Object.keys(renderInfo.upd).forEach(function(bodyId){
			var ctx	= renderInfo.upd[bodyId];
			console.assert( bodyId in collection )
			collection[bodyId].setCtxTick(ctx)
		}.bind(this))
	}
	
	if( 'del' in renderInfo ){
		renderInfo.del.forEach(function(bodyId){
			console.assert( bodyId in collection )
			scene.removeObject( collection[bodyId].obj3d() );
			collection[bodyId].destroy();
			delete collection[bodyId];
		}.bind(this))
	}
}

//////////////////////////////////////////////////////////////////////////////////
//		handle tick events						//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.WebglRender.prototype.tickEventHandler	= function(events)
{
	// return now if there is no events
	if( !events || events.length == 0 )	return;
	// log to debug
	console.log("event", JSON.stringify(events))
	// go thru all events
	events.forEach(function(event){
		// handle events by type
		if( event.type === 'playSound' ){
			this._onPlaySound(event);
		}else console.assert(false);

		
	}.bind(this));
}

WebyMaze.WebglRender.prototype._onPlaySound	= function(event)
{
	var fxId	 = event.data;
	soundRender.soundFxPlay(fxId)	
}

//////////////////////////////////////////////////////////////////////////////////
//		osb user interface stuff					//
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


	// prevent keys to go beyond the modal
	jQuery(inputSel).bind('keypress', function(event){
		event.stopPropagation();
	});
	jQuery(inputSel).bind('keyup', function(event){
		event.stopPropagation();
	});
	jQuery(inputSel).bind('keydown', function(event){
		event.stopPropagation();
	});
	
	//// to detect when enter is pressed, the window is closed
	jQuery(inputSel).bind('keypress', function(event){
		console.log("keycode", event.keyCode);
		if( event.keyCode == 13 ){
			jQuery(dialogSel).jqmHide(); 
			onClose();
		}
		event.stopPropagation();
	}.bind(this));
	
	// put the value in the button label
	jQuery(buttonSel+" span.value").text(this.username)

	jQuery(buttonSel).click(function(){
		this.cameraRender.changeState('facePlayer');
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

		/**
		 * Scale down the image to 340px wide and upload it.
		*/
		var dstWidth	= 640;
		var img 	= new Image();   // Create new Image object
		img.onload = function(){
			var srcAspect	= renderer.domElement.width / renderer.domElement.height;
			console.log("srcAspect", srcAspect)
			var canvas	= document.createElement('canvas');
			canvas.setAttribute('width', dstWidth);
			canvas.setAttribute('height', canvas.width / srcAspect);
			var ctx		= canvas.getContext('2d');
			ctx.fillStyle	= "black";
			ctx.fillRect(0, 0, canvas.width, canvas.height);
			ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
			//console.dir(document.body)
			//document.body.appendChild(canvas);
		
			var smallDataUrl	= canvas.toDataURL("image/png");

			jQuery.post('http://127.0.0.1:8080/upload', {dataUrl: smallDataUrl}, function(data) {
				console.log("screenshoot uploaded. returned data:", data)
			});
		}
		img.src	= dataUrl;

		// FIXME: toDataUrl doesnt display everything... e.g. fog isnt on the image
		// - additionnaly this is only about the canvas, not all the OSD on top
		// - maybe to use another technic to get screenshot of the viewport... chrome specific
		//jQuery.post('http://127.0.0.1:8081/upload', {dataUrl: dataUrl}, function(data) {
		//	console.log("screenshoot uploaded. returned data:", data)
		//});
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

WebyMaze.WebglRender.prototype.soundTrackUiCtor	= function(){
	var buttonSel	= '#soundTrackButton';
	// init the button click
	jQuery(buttonSel).click(function(){
		var running	= soundRender.soundTrackRunning();
		console.log("running", soundRender.soundTrackRunning())
		if( running === false ){
			soundRender.soundTrackStart();
		}else{
			soundRender.soundTrackStop();
		}
		gameConfig.soundTrack(running ? false : true);
		soundRender.enableTrack	= gameConfig.soundTrack() === "true";
		jQuery(buttonSel+" .value").text(gameConfig.soundTrack() === 'true' ? 'On' : 'Off');
	}.bind(this));

	// set the good value in the UI
	jQuery(buttonSel+" .value").text(gameConfig.soundTrack() === 'true' ? 'On' : 'Off');
}

WebyMaze.WebglRender.prototype.soundFxUiCtor	= function(){
	var buttonSel	= '#soundFxButton';
	// init the button click
	jQuery(buttonSel).click(function(){
		var enable	= soundRender.enableFx();
		soundRender.enableFx( !enable )
		gameConfig.soundFx(soundRender.enableFx()) 
		jQuery(buttonSel+" .value").text(gameConfig.soundFx() === 'true' ? 'On' : 'Off');
	}.bind(this));
	// set the good value in the UI
	jQuery(buttonSel+" .value").text(gameConfig.soundFx() === 'true' ? 'On' : 'Off');
}

/**
 * This function update the dom with the current score
*/
WebyMaze.WebglRender.prototype.scoreUIUpdate	= function(){
	var score	= this.players[this.urBodyId].score;
	var containSel	= '#scoreDisplay';
	jQuery(containSel+" span.value").text(score)
}