/** @namespace */
var WebyMaze	= WebyMaze || {};

//////////////////////////////////////////////////////////////////////////////////
//		ctor/dtor							//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.PageSurgame	= function()
{
	this._playerLives	= 1;
	this._playerScore	= 0;
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

WebyMaze.PageSurgame.prototype._pageGameRestart	= function()
{
	console.log("here relaunch", this._playerLives)
	this._pageGameDtor();

	if( false ){
		// old version which reload the page
		window.location.href	= location.protocol+'//'+ location.hostname + location.pathname + "?landingPageBypass=1";		
	}else{
		// new version which remain here
		this._pageGameCtor();			
	}
}
WebyMaze.PageSurgame.prototype._pageGameCtor	= function()
{
	console.assert(!this._pageGame, "pageGame MUST NOT be instanciated")
	this._pageGame	= new WebyMaze.PageGame({
		roundInitCtx	: {
			playerLives	: this._playerLives,
			playerScore	: this._playerScore,
			levelIdx	: this._levelIdx
		}
	});
	// forward 'autodestroy' event
	this._pageGame.bind("autodestroy", function(gameOutput){
		console.log("autodestroyed received", gameOutput);
		// update the score
		this._playerScore	= parseInt(gameOutput.score, 10);
		// handle the result
		if( gameOutput.result === 'win' || true ){
			this._levelIdx	+= 1;
			this._pageGameRestart();
		}else if( gameOutput.result === 'loss' ){
			this._playerLives	-= 1;
			if( this._playerLives >= 0 ){
				this._pageGameRestart();							
			}else{
				// TODO display a game over dialog
				// only this level knows to display this dialog or not
				// so maybe let surGame display do the round end dialog
				// import this function WebyMaze.GameCli.prototype.onGameCompleted
				this.trigger('autodestroy')
			}
		}else	console.assert(false, "gameOutput.result is invalid :"+gameOutput.result)
	}.bind(this));
	console.log("pageGame built", this._pageGame);
}
WebyMaze.PageSurgame.prototype._pageGameDtor	= function()
{
	console.assert( this._pageGame, "pageGame MUST be instanciated")
	this._pageGame.destroy();
	this._pageGame	= null;
}
