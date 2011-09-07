/** @namespace */
var WebyMaze	= WebyMaze || {};

//////////////////////////////////////////////////////////////////////////////////
//		ctor/dtor							//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.PageLanding	= function(opts)
{
	this._pageSel		= "#landingPageContainer";
	this._configStore	= new WebyMaze.ConfigStore();

	// read the game config
	this._config	= WebyMaze.ConfigCli.landingPage;
	
	// show pageContainer
	jQuery(this._pageSel).show();	

	if( this._noWebglDialogMustDisplay() ){
		this._noWebglDialogCtor();
		//alert("mustNoWebglDialog")
	}else{ 
		this._mainDialogCtor();
		this._tutorialDialogCtor();
		this._aboutDialogCtor();
	}
}

WebyMaze.PageLanding.prototype.destroy	= function()
{
	jQuery(this._pageSel).hide();	

	this._configStore.destroy();
	this._configStore	= null;
}

// mixin MicroEvent 
MicroEvent.mixin(WebyMaze.PageLanding);

//////////////////////////////////////////////////////////////////////////////////
//		misc								//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.PageLanding.prototype._gotoGame	= function()
{
	this.trigger('autodestroy')
}

//////////////////////////////////////////////////////////////////////////////////
//		noWebglDialog							//
//////////////////////////////////////////////////////////////////////////////////


WebyMaze.PageLanding.prototype._noWebglDialogMustDisplay	= function()
{
	// test if webgl is needed
	var webGlNeeded	= jQuery.url.param('render') !== 'canvas';
	// test if webgl is supported
	try {
		var webglSupport	= !!window.WebGLRenderingContext && !!document.createElement('canvas').getContext('experimental-webgl');
	}catch(e){
		var webglSupport	= false;
	}
	// test if webgl is explicitly disabled
	var webGlDisable= jQuery.url.param('webglDisable') ? parseInt(jQuery.url.param('webglDisable')) : false;

	// if webGl is not needed, return false
	if( webGlNeeded === false )	return false;
	// if webgl has been explicitly disabled, return true
	if( webGlDisable )		return true;
	// if webgl is supported return false
	if( webglSupport )		return false;
	// if all tests failed, return true
	return true;
}

WebyMaze.PageLanding.prototype._noWebglDialogCtor	= function()
{
	var dialogSel	= "#noWebglDialog";
	jQuery(dialogSel).jqm();
	jQuery(dialogSel).jqmShow();
}

//////////////////////////////////////////////////////////////////////////////////
//		misc								//
//////////////////////////////////////////////////////////////////////////////////

/**
*/
WebyMaze.PageLanding.prototype._mainDialogCtor	= function()
{
	// init the username part
	this._mainDialogUsernameCtor();
	
	
	var pageSel	= this._pageSel;
	var configStore	= this._configStore;
	var dialogSel	= "#landingMainDialog";
	// normal callback
	var toOpen	= function(){ jQuery(dialogSel).jqmShow();	}.bind(this);
	
	// init dialogs
	jQuery(dialogSel).jqm({	overlay	: 0 });

	jQuery(dialogSel+' div.button.play').click(function(){
		// submit username
		this._mainDialogUsernameSubmitCtor();
		// leave landing page
		this._gotoGame();
	}.bind(this));


	jQuery(dialogSel+' div.button.help').click(function(){
		alert("help")
	});
	
	// to make it appear on load
	jQuery(dialogSel).jqmShow();	
}

/**
*/
WebyMaze.PageLanding.prototype._mainDialogUsernameCtor	= function()
{
	var dialogSel	= "#landingMainDialog";
	var inputSel	= dialogSel+" input[name='username']";
	var menuLineSel	= dialogSel+" .twitterUsername";
	// honore this._config
	if( this._config.showUsername !== true )	return;

	// make the menuLine visible
	jQuery(menuLineSel).css('display', 'block');
	
	var username	= this._configStore.username();
	if(username){
		if( username.charAt(0) !== '@' ){
			jQuery(inputSel).val(username)
		}else{
			jQuery(inputSel).val(username.substring(1));
		}
	}
	// handle the reset button - usernameDialog specific
	jQuery(dialogSel+" a.usernameReset").click(function(){
		jQuery(inputSel).val('guest');
	});

	// when enter is pressed, the dialog is closed
	jQuery(inputSel).bind('keypress', function(event){
		if( event.keyCode == "\r".charCodeAt(0) ){
			jQuery(dialogSel+' div.button.play').click();
		}
	}.bind(this));	
}
/**
*/
WebyMaze.PageLanding.prototype._mainDialogUsernameSubmitCtor	= function()
{
	var dialogSel	= "#landingMainDialog";
	var inputSel	= dialogSel+" input[name='username']";
	// get username from <input>
	var username	= jQuery(inputSel).val();
	// if the value is empty, ignore it
	if( username.length != 0 ){
		// add a '@' if it isnt a guest
		if( username.match(/^guest/) === null )	username = '@'+username;		
		// set username in configStore
		this._configStore.username(username);
	}
}

/**
*/
WebyMaze.PageLanding.prototype._tutorialDialogCtor	= function()
{
	var dialogSel	= '#landingTutorialDialog';
	var buttonSel	= this._pageSel+' .button.tutorial';
	// init dialogs
	jQuery(dialogSel).jqm();
	// bind click on .button.about
	jQuery(buttonSel).click(function(){
		jQuery(dialogSel).jqmShow();		
	});	
}

WebyMaze.PageLanding.prototype._aboutDialogCtor	= function()
{
	var dialogSel	= '#landingAboutDialog';
	var buttonSel	= this._pageSel+' .button.about';
	// init dialogs
	jQuery(dialogSel).jqm();
	// bind click on .button.about
	jQuery(buttonSel).click(function(){
		jQuery(dialogSel).jqmShow();		
	});
}
