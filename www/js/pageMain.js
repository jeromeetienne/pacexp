"use strict";

WebyMaze.PageMain	= function()
{
	this._pageLanding	= null;
	this._pageSurGame	= null;

	var landingPageBypass	= jQuery.url.param('landingPageBypass') ? true : false;
	if( landingPageBypass ){
		this._pageSurgameCtor();
	}else{
		this._pageLandingCtor();
	}
}

WebyMaze.PageMain.prototype.destroy	= function()
{
	if( this._pageSurgame )	this._pageSurgameDtor();
	if( this._pageLanding )	this._pageLandingDtor();
}

//////////////////////////////////////////////////////////////////////////////////
//		pageSurgame							//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.PageMain.prototype._pageSurgameCtor	= function()
{
	console.assert(!this._pageSurgame, "pageSurgame MUST NOT be instanciated")
	this._pageSurgame	= new WebyMaze.PageSurgame();
	this._pageSurgame.bind('autodestroy', function(){
		this._pageSurgameDtor();
		if( true ){
			// old version which reload the page
			window.location.href	= location.href;
		}else{
			// new version which remain here
			this._pageLandingCtor();			
		}
	}.bind(this));
	console.log("pageSurgame built", this._pageSurgame);
}
WebyMaze.PageMain.prototype._pageSurgameDtor	= function()
{
	console.assert( this._pageSurgame, "pageSurgame MUST be instanciated")
	this._pageSurgame.destroy();
	this._pageSurgame	= null;
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
		this._pageSurgameCtor();
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
