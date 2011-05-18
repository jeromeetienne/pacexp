"use strict";
//jQuery(function(){	gamePageMain();	})


WebyMaze.PageMain	= function()
{
	this._pageGame		= null;
	this._pageLanding	= null;

	var landingPageBypass	= jQuery.url.param('landingPageBypass') ? true : false;
	if( landingPageBypass ){
		this._pageGameCtor();
	}else{
		this._pageLandingCtor();
	}
}

WebyMaze.PageMain.prototype.destroy	= function()
{
	if( this._pageGame )	this._pageGameDtor();
	if( this._pageLanding )	this._pageLandingDtor();
}


//////////////////////////////////////////////////////////////////////////////////
//		pageGame							//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.PageMain.prototype._pageGameCtor	= function()
{
	console.assert(!this._pageGame, "pageGame MUST NOT be instanciated")
	this._pageGame	= new WebyMaze.PageGame();
	this._pageGame.bind('autodestroy', function(){
		this._pageGameDtor();
		if( true ){
			// old version which reload the page
			window.location.href	= location.protocol+'//'+ location.hostname + location.pathname + "?landingPageBypass=1";		
		}else{
			// new version which remain here
			this._pageLandingCtor();			
		}
	}.bind(this));
	console.log("pageGame built", this._pageGame);
}
WebyMaze.PageMain.prototype._pageGameDtor	= function()
{
	console.assert( this._pageGame, "pageGame MUST be instanciated")
	this._pageGame.destroy();
	this._pageGame	= null;
}



//////////////////////////////////////////////////////////////////////////////////
//		pageLanding							//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.PageMain.prototype._pageLandingCtor	= function()
{
	console.assert(!this._pageLanding, "pageLanding MUST NOT be instanciated")
	this._pageLanding	= new WebyMaze.PageLanding();
	this._pageLanding.bind('autodestroy', function(){
		console.log("autodestroy _pageLanding")
		this._pageLandingDtor();
		this._pageGameCtor();
		console.log("autodestroy _pageLanding done")
	}.bind(this));
	console.log("pageLanding built", this._pageLanding);
}
WebyMaze.PageMain.prototype._pageLandingDtor	= function()
{
	console.assert( this._pageLanding, "pageLanding MUST be instanciated")
	this._pageLanding.destroy();
	this._pageLanding	= null;
}

//////////////////////////////////////////////////////////////////////////////////
//		pageLanding							//
//////////////////////////////////////////////////////////////////////////////////


jQuery(function(){
	new WebyMaze.PageMain();
});
