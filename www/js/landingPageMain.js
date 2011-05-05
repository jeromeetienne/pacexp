var landingPageMain	= function()
{
console.log("slotaaaa")
	var configStore	= new WebyMaze.ConfigStore();
	// show pageContainer
	var pageSel	= "#landingPageContainer";
	jQuery(pageSel).show();	
	
	var dialogSel	= "#landingMainDialog";
	// normal callback
	var toOpen	= function(){ jQuery(dialogSel).jqmShow();	}.bind(this);

console.log("username=", configStore.username())

	var inputSel	= dialogSel+" input[name='username']";

	var username	= configStore.username();
	if(username)	jQuery(inputSel).val(username)

	// when enter is pressed, the dialog is closed
	jQuery(inputSel).bind('keypress', function(event){
		if( event.keyCode == "\r".charCodeAt(0) ){
			jQuery(dialogSel+' a.play').click();
		}
	}.bind(this));	

	
	// init dialogs
	jQuery(dialogSel).jqm({
		overlay	: 0
	});

	jQuery(dialogSel+' div.button.play').click(function(){
		// get username from <input>
		var username	= jQuery(inputSel).val();
		// set username in configStore
		configStore.username(username);
		// leave landing page
		landingPageGotoGame();
	});

	jQuery(dialogSel+' div.button.help').click(function(){
		alert("help")
	});
	
	// to make it appear on load
	jQuery(dialogSel).jqmShow();	
}

var landingPageGotoGame	= function()
{
	// show pageContainer
	var pageSel	= "#landingPageContainer";
	jQuery(pageSel).hide();

	gamePageMain();
}
