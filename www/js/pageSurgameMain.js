/** @namespace */
var WebyMaze	= WebyMaze || {};

//////////////////////////////////////////////////////////////////////////////////
//		ctor/dtor							//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.PageSurgame	= function()
{
	this._playerLives	= 3;
	this._playerScore	= 0;
	this._levelIdx		= 0;

/**
 * TODO rename all the _restartByReload stuff, the cookie name, and the url var too
*/

	this._restartByReload	= false;

	if( this._restartByReload ){
		var landingPageBypass	= jQuery.url.param('landingPageBypass') ? true : false;
		if( landingPageBypass ){
			// sanity check - roundInitCtx MUST be present
			console.assert(jQuery.cookie('closeByReload'));
			// read param from store
			var roundInitCtxStr	= jQuery.cookie('closeByReload');
			this._setRoundInitCtx(JSON.parse(roundInitCtxStr));
		}else{
			// reset param in store
			jQuery.cookie('closeByReload', JSON.stringify(this._getRoundInitCtx()));
		}
	}


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

WebyMaze.PageSurgame.prototype._getRoundInitCtx	= function()
{
	var roundInitCtx	= {
		playerLives	: this._playerLives,
		playerScore	: this._playerScore,
		levelIdx	: this._levelIdx
	};
	return roundInitCtx;
}

WebyMaze.PageSurgame.prototype._setRoundInitCtx	= function(roundInitCtx)
{
	this._playerLives	= roundInitCtx.playerLives;
	this._playerScore	= roundInitCtx.playerScore;
	this._levelIdx		= roundInitCtx.levelIdx;
}

//////////////////////////////////////////////////////////////////////////////////
//		pageGame							//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.PageSurgame.prototype._pageGameRestart	= function()
{
	console.log("here relaunch", this._playerLives)
	this._pageGameDtor();

	if( this._restartByReload ){
		// write roundInitCtx in cookie/ - to be reread after pageReload
		jQuery.cookie('closeByReload', JSON.stringify(this._getRoundInitCtx()));
		// actually reload the page
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
		roundInitCtx	: this._getRoundInitCtx()
	});
	// forward 'autodestroy' event
	this._pageGame.bind("autodestroy", function(gameOutput){
		console.log("autodestroyed received", gameOutput);
		// update the score
		this._playerScore	= parseInt(gameOutput.score, 10);
		// handle the result
		if( gameOutput.result === 'win' ){
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
