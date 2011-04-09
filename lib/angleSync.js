/** @namespace */
var WebyMaze	= WebyMaze || {};

/** @namespace */
WebyMaze.AngleSync	= {}

var TWEEN	= require('./tween.js');
var angleUtils	= require('./angleUtils.js')

//////////////////////////////////////////////////////////////////////////////////
//										//
//////////////////////////////////////////////////////////////////////////////////

/**
 * to sync the handle with a tween
*/
WebyMaze.AngleSync.SyncTween	= function(opts)
{
	console.assert( 'origAngle' in opts );
	this._onUpdate	= opts.onUpdate		|| console.assert(false);
	this._delay	= opts.delay		|| 0.5*1000;
	this._easing	= opts.easing		|| TWEEN.Easing.Quartic.EaseInOut;
	
	this._current	= { a: opts.origAngle };
	this._tween	= null;
}

WebyMaze.AngleSync.SyncTween.prototype.destroy	= function()
{
	this._tweenDtor();
}

WebyMaze.AngleSync.SyncTween.prototype._tweenDtor	= function()
{
	if( this._tween ){
		this._tween.stop();
		this._tween	= null;		
	}
}

WebyMaze.AngleSync.SyncTween.prototype.sync	= function(wishedAngle)
{
	if( angleUtils.radEq(wishedAngle , this.dstAngle) ){
		// just update this tween.
		// TODO it should be updated globally
		// - try to do that in the previous version
		if( this._tween )	this._tween.update(new Date().getTime());
		return;
	}
	
	// delete this._tween is needed
	if( this._tween )	this._tweenDtor();

	this.dstAngle	= angleUtils.radClamp(wishedAngle);
	this._current.a	= angleUtils.radClamp(this._current.a)
	if( Math.abs(this.dstAngle - this._current.a) >= Math.PI ){
		this.dstAngle	+= 2*Math.PI*(this.dstAngle > this._current.a ? -1 : 1);
	}
	this._tween	= new TWEEN.Tween(this._current).to({
			a	: this.dstAngle
		}, this._delay)
		.easing(this._easing)
		.onUpdate(function(){
			// notify the caller for it to update
			this._onUpdate(this._current.a);
		}.bind(this))
		.onComplete(function(){
			//console.log("tween completed")
			this._tweenDtor();
		}.bind(this))
		.start();

	// update the tween
	// TODO update it globally
	this._tween.update(new Date().getTime());
}

//////////////////////////////////////////////////////////////////////////////////
//		export commonjs module						//
//////////////////////////////////////////////////////////////////////////////////

// export commonjs module
if( module && module.exports ){
	module.exports	= WebyMaze.AngleSync;
}
