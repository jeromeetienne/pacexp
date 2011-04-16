/** @namespace */
var WebyMaze	= WebyMaze || {};

/**
 * Various way to sync between 2 angles
 * - tween is the more flexible
 * 
 * @namespace
*/
WebyMaze.AngleSync	= {}

var TWEEN	= require('./tween.js');
var angleUtils	= require('./angleUtils.js')


//////////////////////////////////////////////////////////////////////////////////
//			SyncTween						//
//////////////////////////////////////////////////////////////////////////////////

/**
 * to sync the handle with a tween
*/
WebyMaze.AngleSync.SyncTween	= function(opts)
{
	this._onUpdate	= opts.onUpdate		|| console.assert(false);
	this._delay	= opts.delay		|| 0.5*1000;
	this._easing	= opts.easing		|| TWEEN.Easing.Quartic.EaseInOut;
	console.assert( 'origAngle' in opts );
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
//			SyncSlow						//
//////////////////////////////////////////////////////////////////////////////////

/**
 * to sync the handle with a tween
*/
WebyMaze.AngleSync.SyncSlow	= function(opts)
{
	this._onUpdate	= opts.onUpdate		|| console.assert(false);
	this._maxSpeed	= opts.speed		|| 2.5 * Math.PI/180;
	console.assert( 'origAngle' in opts );
	this._current	= { a: opts.origAngle };
}

WebyMaze.AngleSync.SyncSlow.prototype.destroy	= function()
{
}

WebyMaze.AngleSync.SyncSlow.prototype.sync	= function(wishedAngle)
{	
	// some helpers functions
	var radClamp	= function(val){
		return ( (val % (Math.PI*2) ) + (Math.PI*2) ) % (Math.PI*2);
	};
	// TODO sometime it is not moving for a while... around 1second then it is moving
	// - looks like a rounding error in float
	// - UPDATE: not that important as SyncTween is much better
	var radCenter	= function(val){
		val	= radClamp(val)
		return val <= Math.PI ? val : Math.PI-val;
	};
	// compute the difference between
	var diff	= radCenter(wishedAngle - this._current.a);
	// clamp the diff by the maxSpeed
	diff	= Math.min( this._maxSpeed, diff)
	diff	= Math.max(-this._maxSpeed, diff)
	// update this._current
	this._current.a	+= diff;
	// notify the caller
	this._onUpdate(this._current.a);
}


//////////////////////////////////////////////////////////////////////////////////
//			SyncInstant						//
//////////////////////////////////////////////////////////////////////////////////

/**
 * to sync the handle with a tween
*/
WebyMaze.AngleSync.SyncInstant	= function(opts)
{
	this._onUpdate	= opts.onUpdate		|| console.assert(false);
}

WebyMaze.AngleSync.SyncInstant.prototype.destroy	= function()
{
}

WebyMaze.AngleSync.SyncInstant.prototype.sync	= function(wishedAngle)
{
	// notify the caller
	this._onUpdate(wishedAngle);
}

//////////////////////////////////////////////////////////////////////////////////
//		export commonjs module						//
//////////////////////////////////////////////////////////////////////////////////

// export commonjs module
if( module && module.exports ){
	module.exports	= WebyMaze.AngleSync;
}
