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
	// get info from parameters
	var ctxInit		= opts.ctxInit		|| console.assert(false);
	this._roundInitCtx	= opts.roundInitCtx	|| console.assert(false);

console.log("ROUND ROUND", this._roundInitCtx);
	// read the game config
	this._config	= WebyMaze.ConfigCli.webglRender;

// TODO put that init else where... like in gameCli init
// update: not so sure... maybe just a poor class name


	this.gameId	= ctxInit.gameId;
	this.username	= ctxInit.username;
	this.urBodyId	= ctxInit.urBodyId;
	this.players	= {};
	this.enemies	= {};
	this.shoots	= {};
	this.pills	= {};
	this.visualFxs	= {};


	console.log("ctxInit", ctxInit)
	// init this.mazeCli
	this.mazeCli	= new WebyMaze.MazeCli({
		map	: ctxInit.map
	})
	// update the global scene with this.mazeCli
	sceneContainer.addChild( this.mazeCli.obj3d() );

	// create this._lightingRender
	this._lightingRender	= new WebyMaze.LightingRender({
		mazeCli	: this.mazeCli
	});
	var firstLightingState	= this._config.firstLightingState;
	this._lightingRender.changeState(firstLightingState);

	// init CameraRender
	this._cameraRenderCtor();

	// init MinimapRender
	if( this._config.minimapEnabled === true ){
		this._minimapRender	= new WebyMaze.MinimapRender({
			mazeCli	: this.mazeCli
		});
		sceneContainer.addChild( this._minimapRender.obj3d() );		
	}

	// TODO put the whole UI stuff in its own class (like camera)
	this.scoreUICtor();
	this.energyUICtor();
	this.lifeUICtor();
	this.optionsUICtor();
	this.screenshotUICtor();
	this.soundTrackUiCtor();
	this.soundFxUiCtor();
	this.helpUICtor();
	this.speakUICtor();

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
WebyMaze.WebglRender.prototype.destroy	= function()
{
	this._cameraRenderDtor();
	this.mazeCli.destroy();
}

WebyMaze.WebglRender.prototype.getEnemies	= function()
{
	return this.enemies;
}

//////////////////////////////////////////////////////////////////////////////////
//		cameraRender stuff						//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.WebglRender.prototype._cameraRenderCtor	= function()
{
	this.cameraRender	= new WebyMaze.CameraRender();
	this.cameraRender.bind('stateChange', function(newState, oldState){
		console.log("newState", newState, "oldState", oldState)
		var rotationType	= WebyMaze.CameraRender.State2RotationType[newState];
		var configRotation	= this._config.playerRotation;
		var rotation2ControlType= {
			'grid'	: {
				"absolute"	: 'cardinalAbsolute',
				"relative"	: 'guidedRelative'				
			},
			'free'	: {				
				"absolute"	: 'freeRelative',
				"relative"	: 'freeRelative'
			}
		};
		gameCli.socketSend({
			type	: 'setControlType',
			data	: rotation2ControlType[configRotation][rotationType]
		})
	}.bind(this));
	// init this.cameraRender
	var firstCameraState	= this._config.firstCameraState;
	this.cameraRender.changeState(firstCameraState);	
}
WebyMaze.WebglRender.prototype._cameraRenderDtor	= function()
{
	
}


//////////////////////////////////////////////////////////////////////////////////
//		setCtxTick							//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.WebglRender.prototype.setCtxTick	= function(ctxTick)
{
	//console.log("ctxTick", ctxTick)
	this.setCtxTickPlayer(ctxTick);
	this.setCtxTickEnemy(ctxTick);
	this.setCtxTickShoot(ctxTick);
	this.setCtxTickPill(ctxTick);

	this.tickEventHandler(ctxTick.events)

	// do the tick for this.visualFxs
	Object.keys(this.visualFxs).forEach(function(visualFxId){
		var visualFx	= this.visualFxs[visualFxId];
		visualFx.tick();
	}.bind(this));

	// handle the .obj3d() update for enemy
	Object.keys(this.enemies).forEach(function(enemyId){
		var enemy	= this.enemies[enemyId];
		if( enemy.object3dDirty() !== true )	return;
		sceneContainer.addChild( enemy.obj3d() );
		enemy.object3dDirty(false)
	}.bind(this));
	
	// handle the scoreUiUpdate
	this.scoreUIUpdate();
	// handle the energyUiUpdate
	this.energyUIUpdate();

	// update MinimapRender
	this._minimapRender && this._minimapRender.update({
		urBodyId	: this.urBodyId,
		players		: this.players,
		enemies		: this.enemies,
		rotationType	: WebyMaze.CameraRender.State2RotationType[this.cameraRender.getState()]
	});

	// update CameraRender	
	var targetObject3d	= this.players[this.urBodyId].obj3d()
	this.cameraRender.tick(targetObject3d);

	// update this._lightingRender
	this._lightingRender.tick();	
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
		if( event.type === 'soundStart' ){
			this._onSoundStart(event);
		}else if( event.type === 'soundStop' ){
			this._onSoundStop(event);
		}else if( event.type === 'showVisualFx' ){
			this._onShowVisualFx(event);
		}else if( event.type === 'setLighting' ){
			this._onSetLighting(event);
		}else console.assert(false, "unknown tickEvent", event.type, "event", event);
	}.bind(this));
}

WebyMaze.WebglRender.prototype._onSoundStart	= function(event)
{
	var fxId	= event.data.fxId;
	var opts	= event.data.opts;
	soundRender.soundFxStart(fxId, opts)	
}

WebyMaze.WebglRender.prototype._onSoundStop	= function(event)
{
	var fxId	= event.data.fxId;
	soundRender.soundFxStop(fxId)	
}

WebyMaze.WebglRender.prototype._onSetLighting	= function(event)
{
	var ligthingState	 = event.data;
	this._lightingRender.changeState(ligthingState);
}

WebyMaze.WebglRender.prototype._onShowVisualFx	= function(event)
{
	var fxType	= event.data.type;
	var fxData	= event.data.data;
	var bodyId	= (Math.random()*99999).toString(36);
	
	console.log("fxType", fxType)
	
	// create the visualFx
	if( fxType === 'impact' ){
		var visualFx	= new WebyMaze.VisualFxImpact({
			webglRender	: this,
			position	: fxData.position,
			timeToLive	: fxData.timeToLive
		});	
		// add this fx in the to sceneContainer
		sceneContainer.addChild( visualFx.obj3d() );
	}else if( fxType === 'caption' ){
		var visualFx	= new WebyMaze.VisualFxCaption({
			webglRender	: this,
			position	: fxData.position,
			textData	: fxData.textData,
			timeToLive	: fxData.timeToLive
		});
		// add this fx in the to sceneContainer
		sceneContainer.addChild( visualFx.obj3d() );
	}else	console.assert(false);

	visualFx.bind('autodestroy', function(){
		scene.removeObject( visualFx.obj3d() );
		visualFx.destroy();
		delete this.visualFxs[bodyId];
	}.bind(this))

	// add this visualFx in this.visualFxs
	this.visualFxs[bodyId]	= visualFx;	
}


//////////////////////////////////////////////////////////////////////////////////
//		osd user interface stuff					//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.WebglRender.prototype.scoreUICtor	= function()
{
	var menuLineSel	= '#scoreMenuLine';
	// honore this._config
	if( this._config.showScoreMenu !== true )	return;
	// make the menuLine visible
	jQuery(menuLineSel).css('display', 'block');
}

WebyMaze.WebglRender.prototype.energyUICtor	= function()
{
	var menuLineSel	= '#energyMenuLine';
	// honore this._config
	if( this._config.showEnergyMenu !== true )	return;
	// make the menuLine visible
	jQuery(menuLineSel).css('display', 'block');
}

WebyMaze.WebglRender.prototype.lifeUICtor	= function()
{
	var menuLineSel	= '#lifeMenuLine';
	// honore this._config
	if( this._config.showLifeMenu !== true )	return;
	// make the menuLine visible
	jQuery(menuLineSel).css('display', 'block');
	
	// display the life 
	var playerLives	= this._roundInitCtx.playerLives;
	jQuery(menuLineSel).empty();
	for(var i = 0; i < playerLives; i++){
		jQuery('<img>').attr('src', 'images/logo128.png').appendTo(menuLineSel)
	}
}

WebyMaze.WebglRender.prototype.optionsUICtor	= function()
{
	var dialogSel	= '#optionsDialog';
	var buttonSel	= '#optionsButton';
	var menuLineSel	= '#optionsMenuLine';
	// honore this._config
	if( this._config.showOptionsMenu !== true )	return;
	// make the menuLine visible
	jQuery(menuLineSel).css('display', 'block');

	// normal callback
	var toOpen	= function(){
		usernameFill();
		gameIdFill();
		jQuery(dialogSel).jqmShow();
	}.bind(this);
	var onHide	= function(hash){
		// hide the jqm
		hash.o.remove();hash.w.hide();
		// handle change
		usernameChange();
		gameIdChange();
	}.bind(this);

	// init dialogs
	jQuery(dialogSel).jqm({	onHide	: onHide });
	// if buttonSel is clicked, open the dialog
	jQuery(buttonSel).click(toOpen);


	// handle the username
	var usernameInputSel	= dialogSel + ' input[name=username]';
	var usernameMenuLineSel	= '#usernameMenuLine';
	// make the usernameMenuLine visible or not
	if( this._config.showUsernameMenu === true )	jQuery(usernameMenuLineSel).css('display', 'block');
	
	var usernameFill	= function(){
		if( this.username.charAt(0) !== '@' )	jQuery(usernameInputSel).val(this.username)
		else	jQuery(usernameInputSel).val(this.username.substring(1));
	}.bind(this)
	var usernameChange	= function(){
		// get the value from the element
		var username	= jQuery(usernameInputSel).val();
		// if the value is empty, ignore it
		if( username.length == 0 )		return;
		// add a '@' if it isnt a guest
		if( username.match(/^guest/) === null )	username = '@'+username;		
		// if the value is same as before, ignore it
		if( username == this.username )		return;
		// notify the server
		gameCli.socketSend({
			type	: "changeUsername",
			data	: username
		});
		// update local var
		this.username	= username;
		// change the gameConfig
		gameConfig.username(username);
	}.bind(this);
	// handle the reset button - usernameDialog specific
	jQuery(dialogSel+" a.usernameReset").click(function(){
		jQuery(usernameInputSel).val('guest');
		jQuery(dialogSel).jqmHide();
	});

	// handle the gameId
	var gameInputSel	= dialogSel + ' input[name=gameId]';
	var gameIdMenuLineSel	= '#gameIdMenuLine';
	// make the usernameMenuLine visible or not
	if( this._config.showGameIdMenu === true )	jQuery(gameIdMenuLineSel).css('display', 'block');

	var gameIdFill	= function(){
		jQuery(gameInputSel).val(this.gameId);
	}.bind(this);
	var gameIdChange= function(hash){
		// get the value from the element
		var gameId	= jQuery(gameInputSel).val();
		// if the value is empty, ignore it
		if( gameId.length == 0 )	return;
		// if the value is same as before, ignore it
		if( gameId == this.gameId )	return;
		// change the gameConfig
		gameConfig.gameId(gameId);		
		// refresh UI
		uiRefresh();
		// reload the page to init new game...
		// FIXME this is dirty
		window.location.reload();
	}.bind(this);

	// stopPropagation of keys event beyond the modal
	jQuery(dialogSel).bind('keypress'	, function(event){ event.stopPropagation(); });
	jQuery(dialogSel).bind('keyup'		, function(event){ event.stopPropagation(); });
	jQuery(dialogSel).bind('keydown'	, function(event){ event.stopPropagation(); });
	// when enter is pressed, the dialog is closed
	jQuery(dialogSel).bind('keypress', function(event){
		if( event.keyCode == "\r".charCodeAt(0) ){
			jQuery(dialogSel).jqmHide(); 
		}
	}.bind(this));
}

WebyMaze.WebglRender.prototype.screenshotUICtor	= function()
{
	var buttonSel	= '#screenshotButton';
	var menuLineSel	= '#screenshotMenuLine';

	// honore this._config
	if( this._config.showScreenshotMenu !== true )	return;
	// make the menuLine visible
	jQuery(menuLineSel).css('display', 'block');


	var doScreenshot	= function(){
		var dataUrl	= renderer.domElement.toDataURL("image/png");

		/**
		 * Scale down the image to 320px wide and upload it.
		*/
		var dstWidth	= 450;
		var img 	= new Image();   // Create new Image object
		img.onload	= function(){
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

			
			// put it on the DOM for debug
			jQuery(canvas).css({
				position:	'absolute',
				top:		'0px',
				right:		'0px'
			}).appendTo('body')
		
			var smallDataUrl	= canvas.toDataURL("image/jpg");
			// TODO put that in a configCli.js
			var screenshotUploadUrl	= this._config.screenshotUploadUrl;
			jQuery.post(screenshotUploadUrl, {dataUrl: smallDataUrl}, function(dataJson){
				var data	= JSON.parse(dataJson);
				console.log("screenshoot uploaded. returned data:", data)
				// send the userMessage to the server
				gameCli.socketSend({
					type	: "userMessage",
					data	: {
						createdAt	: Date.now(),
						text		: this.username+' just took this picture ! '+data.imgUrl
					}
				})
			}.bind(this));
		}.bind(this);
		img.src		= dataUrl;

		// FIXME: toDataUrl doesnt display everything... e.g. fog isnt on the image
		// - additionnaly this is only about the canvas, not all the OSD on top
		// - maybe to use another technic to get screenshot of the viewport... chrome specific
		//jQuery.post('http://127.0.0.1:8081/upload', {dataUrl: dataUrl}, function(data) {
		//	console.log("screenshoot uploaded. returned data:", data)
		//});
	}.bind(this)

	
	// bind buttonSel click
	jQuery(buttonSel).click(doScreenshot)	
	// bind global document 'Alt+p' for screenshot
	jQuery(document).bind('keydown', 'Alt+p', function(event){
		doScreenshot();
		return false;
	}.bind(this));	
}



WebyMaze.WebglRender.prototype.speakUICtor	= function()
{
	var dialogSel	= '#speakDialog';
	var buttonSel	= '#speakButton';
	var menuLineSel	= '#speakMenuLine';
	var inputSel	= dialogSel+ ' input';

	// honore this._config
	if( this._config.showSpeakMenu !== true )	return;
	// make the menuLine visible
	jQuery(menuLineSel).css('display', 'block');

	// normal callback
	var toOpen	= function(){
		// if it is already visible, do nothing
		if( jQuery(dialogSel).is(':visible') )	return;
		
		jQuery(inputSel).val('')
		jQuery(dialogSel).jqmShow();
	}.bind(this);
	var onHide	= function(hash){
		// hide the jqm
		hash.o.remove();hash.w.hide();
		// put the focus back... not sure why this is needed FIXME
		jQuery('#gamePageContainer').focus();
		// get the value from the input
		var value	= jQuery(inputSel).val();
		// exit if there is nothing here
		if( value === '' )	return;
		console.log("type "+value);
		// send the userMessage to the server
		gameCli.socketSend({
			type	: "userMessage",
			data	: {
				createdAt	: Date.now(),
				srcUsername	: this.username,
				text		: value
			}
		})
	}.bind(this);

	// init dialogs
	jQuery(dialogSel).jqm({ onHide	: onHide });
	// if buttonSel is clicked, open the dialog
	jQuery(buttonSel).click(toOpen);
	// stopPropagation of keys event beyond the modal
	jQuery(inputSel).bind('keyup'	, function(event){ event.stopPropagation(); });
	jQuery(inputSel).bind('keydown'	, function(event){ event.stopPropagation(); });
	// when enter is pressed, the dialog is closed
	jQuery(inputSel).bind('keypress', function(event){
		if( event.keyCode == "\r".charCodeAt(0) ){
			jQuery(dialogSel).jqmHide(); 
		}
	}.bind(this));	

	// bind global document 'Alt+p' for screenshot
	jQuery(document).bind('keydown', 'Alt+t', function(event){
		toOpen();
		return false;
	}.bind(this));	
}

WebyMaze.WebglRender.prototype.helpUICtor	= function()
{
	var dialogSel	= '#helpDialog';
	var buttonSel	= '#helpButton';
	var menuLineSel	= '#helpMenuLine';

	// honore this._config
	if( this._config.showHelpMenu !== true )	return;
	// make the menuLine visible
	jQuery(menuLineSel).css('display', 'block');

	// normal callback
	var toOpen	= function(){
		jQuery(dialogSel).jqmShow();
	}.bind(this);
	var onHide	= function(hash){
		// hide the jqm
		hash.o.remove();hash.w.hide();
	}.bind(this);

	// init dialogs
	jQuery(dialogSel).jqm({	onHide	: onHide });
	// if buttonSel is clicked, open the dialog
	jQuery(buttonSel).click(toOpen);
	// when enter is pressed, the dialog is closed
	jQuery(dialogSel).bind('keypress', function(event){
		jQuery(dialogSel).jqmHide(); 
	}.bind(this));	
	jQuery(dialogSel).click(function(event){
		jQuery(dialogSel).jqmHide(); 
	}.bind(this));
}

WebyMaze.WebglRender.prototype.soundTrackUiCtor	= function()
{
	var buttonSel	= '#soundTrackButton';
	var menuLineSel	= '#soundTrackMenuLine';
	
	// honore this._config
	if( this._config.showSoundTrackMenu !== true )	return;
	// make the menuLine visible
	jQuery(menuLineSel).css('display', 'block');

	// init the button click
	jQuery(buttonSel).click(function(){
		var running	= soundRender.soundTrackRunning();
		//console.log("soundTrack running", soundRender.soundTrackRunning())
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

WebyMaze.WebglRender.prototype.soundFxUiCtor	= function()
{
	var buttonSel	= '#soundFxButton';
	var menuLineSel	= '#soundFxMenuLine';
	
	// honore this._config
	if( this._config.showSoundFxMenu !== true )	return;
	// make the menuLine visible
	jQuery(menuLineSel).css('display', 'block');

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
WebyMaze.WebglRender.prototype.scoreUIUpdate	= function()
{
	// get urPlayer
	var urPlayer	= this.players[this.urBodyId];
	// test dirty flag
	if( urPlayer.dirtyScore !== true )	return;
	// clear dirty flag
	urPlayer.dirtyScore	= false;
	// update the ui
	var value	= urPlayer.score;
	var containSel	= '#scoreMenuLine';
	jQuery(containSel+" span.value").text(value)
}

/**
 * This function update the dom with the current score
*/
WebyMaze.WebglRender.prototype.energyUIUpdate	= function(){
	// get urPlayer
	var urPlayer	= this.players[this.urBodyId];
	// test dirty flag
	if( urPlayer.dirtyEnergy !== true )	return;
	// clear dirty flag
	urPlayer.dirtyEnergy	= false;
	// update the ui
	var value	= this.players[this.urBodyId].energy;
	var containSel	= '#energyMenuLine';
	jQuery(containSel+" span.value").text(value+'%')
}





