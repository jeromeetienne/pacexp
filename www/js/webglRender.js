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
	//console.log("ctxTick", ctxTick)
	this.setCtxTickPlayer(ctxTick);
	this.setCtxTickShoot0(ctxTick);
	this.setCtxTickPill(ctxTick);
	if( ctxTick.events.length )
		console.log("event", JSON.stringify(ctxTick.events))
	
	var targetObject3d	= this.players[this.urBodyId].obj3d()
	this.cameraRender.tick(targetObject3d);
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
			this.players[bodyId]	= new WebyMaze.PlayerCli(player);
			// add the body to the scene IIF not mine
			if( displayMe || bodyId !== this.urBodyId){
				sceneContainer.addChild( this.players[bodyId].obj3d() );
			}
		}
		// update setCtxTick
		this.players[bodyId].setCtxTick(player)
	}.bind(this));
	
	// handle the scoreUiUpdate
	if( this.players[this.urBodyId].scoreNeedsUpdate ){
		this.scoreUIUpdate();
		this.players[this.urBodyId].scoreNeedsUpdate	= false;
	}


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
WebyMaze.WebglRender.prototype.setCtxTickShootConvert	= function(ctxTick){
	var nctx	= {
		add	: {},
		upd	: {},
		del	: []
	};
	ctxTick.shoots.forEach(function(shootCtx){
		var bodyId	= shootCtx.bodyId;
		var created	= bodyId in this.shoots
		if( !created )	nctx.add[bodyId]	= shootCtx;
		else		nctx.upd[bodyId]	= shootCtx;
	}.bind(this));
	
	// remove the obsolete shoots
	Object.keys(this.shoots).forEach(function(bodyId){
		for(var i = 0; i < ctxTick.shoots.length; i++){
			var shoot	= ctxTick.shoots[i];
			if( bodyId === shoot.bodyId ) return;
		}
		nctx.del.push(bodyId);
	}.bind(this));
	// remove empty fields
	if( Object.keys(nctx.add).length === 0 )	delete nctx.add;
	if( Object.keys(nctx.upd).length === 0 )	delete nctx.upd;
	if( nctx.del.length === 0 )			delete nctx.del;
	// return the just-built nctx
	return nctx;
}

/**
 * tick all the shoot
 * 
 * TODO make this function generic
 * - the same function for shoot/pill/player
*/
WebyMaze.WebglRender.prototype.setCtxTickShoot0	= function(ctxTick)
{
	// TODO
	// - this.shoots : collection
	// - Class
	// -
	var collection	= this.shoots;
	var classCtor	= WebyMaze.ShootCli;
	
	ctxTick	= this.setCtxTickShootConvert(ctxTick)
	if( Object.keys(ctxTick).length )	console.log("ctxTick", ctxTick)

	
	if( 'add' in ctxTick ){
		Object.keys(ctxTick.add).forEach(function(bodyId){
			var ctx	= ctxTick.add[bodyId];
			console.assert( !(bodyId in collection) )
			collection[bodyId]	= new classCtor();
			collection[bodyId].setCtxTick(ctx)
			sceneContainer.addChild( collection[bodyId].obj3d() );
		}.bind(this))
	}
	
	if( 'upd' in ctxTick ){
		Object.keys(ctxTick.upd).forEach(function(bodyId){
			var ctx	= ctxTick.upd[bodyId];
			console.assert( bodyId in collection )
			collection[bodyId].setCtxTick(ctx)
		}.bind(this))
	}
	
	if( 'del' in ctxTick ){
		ctxTick.del.forEach(function(bodyId){
			console.assert( bodyId in collection )
			scene.removeObject( collection[bodyId].obj3d() );
			collection[bodyId].destroy();
			delete collection[bodyId];
		}.bind(this))
	}
}

/**
 * tick all the shoot
 *
*/
WebyMaze.WebglRender.prototype.setCtxTickShoot	= function(ctxTick)
{
	var nctx	= this.setCtxTickShootConvert(ctxTick)
	if( Object.keys(nctx).length )	console.log("nctx", nctx)
	
	// handle ctxTick.shoots
	ctxTick.shoots.forEach(function(shoot){
		var bodyId	= shoot.bodyId;
		var created	= bodyId in this.shoots;
		// create shoot if needed
		if( ! created )	this.shoots[bodyId]	= new WebyMaze.ShootCli();
		// update setCtxTick
		this.shoots[bodyId].setCtxTick(shoot)
		// add the new shoot in sceneContainer
		if( ! created )	sceneContainer.addChild( this.shoots[bodyId].obj3d() );
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

/**
 * tick all the pill
 *
*/
WebyMaze.WebglRender.prototype.setCtxTickPill	= function(ctxTick){
	// handle ctxTick.pills
	ctxTick.pills.forEach(function(pill){
		var bodyId	= pill.bodyId;
		var created	= bodyId in this.pills
		// create pill if needed
		if( !created )	this.pills[bodyId]	= new WebyMaze.PillCli();
		// update setCtxTick
		this.pills[bodyId].setCtxTick(pill)
		// add this object to the scene
		if( !created )	sceneContainer.addChild( this.pills[bodyId].obj3d() );
	}.bind(this));
	
	// remove the obsolete pills
	Object.keys(this.pills).forEach(function(bodyId){
		for(var i = 0; i < ctxTick.pills.length; i++){
			var pill	= ctxTick.pills[i];
			if( bodyId === pill.bodyId ) return;
		}
		scene.removeObject( this.pills[bodyId].obj3d() );
		this.pills[bodyId].destroy();
		delete this.pills[bodyId];
	}.bind(this));
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

/**
 * This function update the dom with the current score
*/
WebyMaze.WebglRender.prototype.scoreUIUpdate	= function(){
	var score	= this.players[this.urBodyId].score;
	var containSel	= '#scoreDisplay';
	jQuery(containSel+" span.value").text(score)
}