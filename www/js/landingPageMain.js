/** @namespace */
var WebyMaze	= WebyMaze || {};

//////////////////////////////////////////////////////////////////////////////////
//		ctor/dtor							//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.LandingPage	= function(opts)
{
	this._configStore	= new WebyMaze.ConfigStore();
	this._pageSel		= "#landingPageContainer";
	
	// show pageContainer
	jQuery(this._pageSel).show();	
	
	this._mainDialogCtor();
	this._tutorialDialogCtor();
	this._aboutDialogCtor();
}

WebyMaze.LandingPage.prototype.destroy	= function()
{
	this._configStore.destroy();
}


//////////////////////////////////////////////////////////////////////////////////
//		misc								//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.LandingPage.prototype._gotoGame	= function()
{
	// show pageContainer
	var pageSel	= "#landingPageContainer";
	jQuery(pageSel).hide();

	gamePageMain();
}

WebyMaze.LandingPage.prototype._mainDialogCtor	= function()
{
	var pageSel	= this._pageSel;
	var configStore	= this._configStore;
	var dialogSel	= "#landingMainDialog";
	// normal callback
	var toOpen	= function(){ jQuery(dialogSel).jqmShow();	}.bind(this);

console.log("username=", configStore.username())

	var inputSel	= dialogSel+" input[name='username']";

	var username	= configStore.username();
	if(username){
		if( username.charAt(0) !== '@' )	jQuery(inputSel).val(username)
		else	jQuery(inputSel).val(username.substring(1));
	}
	// handle the reset button - usernameDialog specific
	jQuery(dialogSel+" a.usernameReset").click(function(){
		jQuery(inputSel).val('guest');
	});

	// when enter is pressed, the dialog is closed
	jQuery(inputSel).bind('keypress', function(event){
		if( event.keyCode == "\r".charCodeAt(0) ){
			jQuery(dialogSel+' a.play').click();
		}
	}.bind(this));	

	
	// init dialogs
	jQuery(dialogSel).jqm({	overlay	: 0 });

	jQuery(dialogSel+' div.button.play').click(function(){
		// get username from <input>
		var username	= jQuery(inputSel).val();
		// if the value is empty, ignore it
		if( username.length != 0 ){
			// add a '@' if it isnt a guest
			if( username.match(/^guest/) === null )	username = '@'+username;		
			// set username in configStore
			configStore.username(username);
		}
		// leave landing page
		this._gotoGame();
	}.bind(this));


	jQuery(dialogSel+' div.button.help').click(function(){
		alert("help")
	});
	
	// to make it appear on load
	jQuery(dialogSel).jqmShow();	
}

WebyMaze.LandingPage.prototype._tutorialDialogCtor	= function()
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

WebyMaze.LandingPage.prototype._aboutDialogCtor	= function()
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