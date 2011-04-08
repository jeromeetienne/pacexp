/** @namespace */
var WebyMaze	= WebyMaze || {};

//////////////////////////////////////////////////////////////////////////////////
//		ctor/dtor							//
//////////////////////////////////////////////////////////////////////////////////

/**
 * Class for the enemy on server
*/
WebyMaze.EnemySrv	= function(opts){
	this.position	= opts.position	|| console.assert(false);
	this.rotation	= opts.rotation || console.assert(false);

	this.appearance	= null;
	this.stage	= null;
	this.setStage('scatter');
	
	this.stageTimeout	= null;

	// FIXME check if this.bodyId is actually unique
	this.bodyId	= "enemy-"+Math.floor(Math.random()*9999999).toString(36);
	this.speedFwd	= 10.0;
	this.bodyW	= 100;
}

WebyMaze.EnemySrv.prototype.destroy	= function()
{
	this._timeoutDtor();
}

//////////////////////////////////////////////////////////////////////////////////
//		misc								//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.EnemySrv.prototype.tick	= function()
{
	var cardToAngle	= {
		east	: -Math.PI/2,
		north	:  Math.PI,
		west	:  Math.PI/2,
		south	:  0
	};
	
	var cardDir	= 'north';
	this.moveRot	= cardToAngle[cardDir]
	
	this.position.x += Math.cos(this.moveRot)*this.speedFwd;
	this.position.y += Math.sin(this.moveRot)*this.speedFwd;
}


WebyMaze.EnemySrv.prototype.setStage	= function(stage)
{
	// save the new stage
	this.stage	= stage;
	
	if( stage == "chase" ){
		this.appearance	= "happy";
		this._timeoutCtor(30*1000, function(){
			this.setStage('scatter');
		}.bind(this));
	}else if( stage == "scatter" ){
		this.appearance	= "happy";		
		this._timeoutCtor(10*1000, function(){
			this.setStage('chase');
		}.bind(this));
	}else if( stage == "frightened" ){
		this.appearance	= "hurt";
		this._timeoutCtor(15*1000, function(){
			this.setStage('chase');
		}.bind(this));
	}else if( stage == "zombie" ){
		this.appearance	= "eyes";
		
		this._timeoutCtor(10*1000, function(){
			this.setStage('chase');
		}.bind(this));
	}else{
		console.assert(false, "unknown stage"+stage)
	}
}

WebyMaze.EnemySrv.prototype._timeoutCtor	= function(delay, callback)
{
	this._timeoutDtor();
	this._timeoutId	= setTimeout(function(){
		callback();
	}, delay)
}

WebyMaze.EnemySrv.prototype._timeoutDtor	= function()
{
	if( this.stageTimeout ){
		clearTimeout(this.stageTimeout)
		this.stageTimeout	= null;
	}	
}

//////////////////////////////////////////////////////////////////////////////////
//		renderInfo							//
//////////////////////////////////////////////////////////////////////////////////

/**
 * return a RenderInfoFull
*/
WebyMaze.EnemySrv.prototype.renderInfoFull	= function(){
	return JSON.parse(JSON.stringify({
		position	: this.position,
		rotation	: this.rotation,
		appearance	: this.appearance,
		bodyId		: this.bodyId
	}));
}

/**
 * compute the RenderInfoDiff between 2 RenderInfoFull
*/
WebyMaze.EnemySrv.prototype.renderInfoEqual	= function(full1, full2){
	if( full1.position.x	!== full2.position.x )	return false;
	if( full1.position.y	!== full2.position.y )	return false;
	if( full1.rotation.z	!== full2.rotation.z )	return false;
	if( full1.appearance	!== full2.appearance )	return false;
	if( full1.bodyId	!== full2.bodyId )	return false;
	return true;
}

/**
 * Build contextTick for this body
 * - only for backward compatibility
*/
WebyMaze.EnemySrv.prototype.buildContextTick	= function(){
	return this.renderInfoFull();
}

//////////////////////////////////////////////////////////////////////////////////
//		commonjs exports						//
//////////////////////////////////////////////////////////////////////////////////

// export commonjs module
if( module && module.exports ){
	module.exports	= WebyMaze.EnemySrv;
}
