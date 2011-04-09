/** @namespace */
var WebyMaze	= WebyMaze || {};

var TWEEN	= require('./tween.js');
var angleUtils	= require('./angleUtils.js')

//////////////////////////////////////////////////////////////////////////////////
//										//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.AngleSync.syncTween	= function(opts)
{
	this._tweenRotZ	= null;
	this._tweenItem	= null;
}
WebyMaze.AngleSync.syncTween.prototype.destroy	= function()
{
	if( this._tweenItem )	this._tweenDtor();
}

WebyMaze.AngleSync.syncTween.prototype._tweenDtor	= function()
{
	this._tweenItem.stop();
	this._tweenItem	= null;
}

WebyMaze.AngleSync.syncTween.prototype.sync	= function(moreRot)
{
	if( angleUtils.radEq(moveRot , this._tweenRotZ) === false ){
		// delete this._tween is needed
		if( this._tweenItem )	this._tweenDtor();

		this._tweenRotZ	= angleUtils.radClamp(moveRot);
		this.rotation.z	= angleUtils.radClamp(this.rotation.z)
//console.log("_syncRotationTween before", this.rotation.z, "to", this._tweenRotZ, "moveRot", this.moveRot)
//console.log("diff", angleUtils.radDiff(this._tweenRotZ, this.rotation.z))
		if( Math.abs(this._tweenRotZ - this.rotation.z) >= Math.PI ){
			this._tweenRotZ	+= 2*Math.PI*(this._tweenRotZ > this.rotation.z ? -1 : 1);
		}
//console.log("_syncRotationTween after from", this.rotation.z, "to", this._tweenRotZ)
//console.log("diff", angleUtils.radDiff(this._tweenRotZ, this.rotation.z))
		this._tweenItem	= new TWEEN.Tween(this.rotation).to({
						z	: this._tweenRotZ
					}, 0.5*1000)
					.easing(TWEEN.Easing.Quartic.EaseInOut)
					.onComplete(function(){
						console.log("tween completed")
						this._tweenDtor();
					}.bind(this))
					.start();
	}
	
	if( this._tweenItem ){
		this._tweenItem.update(new Date().getTime());
	}
}