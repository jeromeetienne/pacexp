/** @namespace */
var WebyMaze	= WebyMaze || {};

//////////////////////////////////////////////////////////////////////////////////
//		ctor/dtor							//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.PageSurgame	= function()
{
	this._playerLives	= 3;
	this._levelIdx		= 0;
	this._pageGameCtor({
		playerLives	: this._playerLives,
		levelIdx	: this._levelIdx		
	});
}

WebyMaze.PageSurgame.prototype.destroy	= function()
{
	this._pageGameDtor();
}

// mixin MicroEvent 
MicroEvent.mixin(WebyMaze.PageSurgame);


//////////////////////////////////////////////////////////////////////////////////
//		pageGame							//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.PageSurgame.prototype._pageGameCtor	= function()
{
	console.assert(!this._pageGame, "pageGame MUST NOT be instanciated")
	this._pageGame	= new WebyMaze.PageGame();
	this._pageGame.bind('autodestroy', function(){
		console.log("pageSurgame received autodestroy")
		this.trigger('autodestroy', function(){
			this.trigger.apply(this, arguments)
		}.bind(this))
	}.bind(this));
	console.log("pageGame built", this._pageGame);
}
WebyMaze.PageSurgame.prototype._pageGameDtor	= function()
{
	console.assert( this._pageGame, "pageGame MUST be instanciated")
	this._pageGame.destroy();
	this._pageGame	= null;
}
