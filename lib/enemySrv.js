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
	this.maze	= opts.maze	|| console.assert(false);

	this.appearance	= null;
	this.stage	= null;
	this.setStage('scatter');
	
	this.stageTimeout	= null;

	// FIXME check if this.bodyId is actually unique
	this.bodyId	= "enemy-"+Math.floor(Math.random()*9999999).toString(36);
	this.speedFwd	= 2.5;
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
return;
	var cardToAngle	= {
		east	:  0,
		north	:  Math.PI/2,
		west	:  Math.PI,
		south	: -Math.PI/2
	};

	// put this.position on a this.speedFwd grid
	// - it avoid aproximation bug in the wholeSquare computation
	this.position.x	-= this.position.x % this.speedFwd
	this.position.y	-= this.position.y % this.speedFwd

	// wholeSquare is true
	var wholeSquare	= Math.abs(this.position.x % this.maze.tileW) === 0
				&&
				Math.abs(this.position.y % this.maze.tileW) === 0;

	if( wholeSquare ){
		var srcX	= this.maze.space2mapX(this.position.x);
		var srcY	= this.maze.space2mapY(this.position.y);
		var cardDir	= require('./tmp/mapUtils.js').distMapMazeSrv2ShortestDir(this.maze, this.maze.mapH()-1-srcY, srcX, 16, 1);
		//var cardDir	= require('./tmp/mapUtils.js').distMapMazeSrv2ShortestDir(this.maze, this.maze.mapH()-1-srcY, this.maze.mapW()-2-srcX, 1, 1);
console.log("enemy srcX", srcX, "srcY", srcY)
console.log("cardDir", cardDir)
console.log("real spaceX", this.position.x, "spaceY", this.position.y)
console.log("theo spaceX", this.maze.map2spaceX(srcX), "spaceY", this.maze.map2spaceY(srcY))
//console.assert(false);
		if( cardDir === 'north' )	this.moveRot = cardToAngle['west'];
		else if( cardDir === 'west' )	this.moveRot = cardToAngle['north'];
		//else if( cardDir === 'east' )	this.moveRot = cardToAngle['south'];
		else if( cardDir === 'south' )	this.moveRot = cardToAngle['east'];
	}

	if( this.moveRot ){
		this.position.x += Math.cos(this.moveRot)*this.speedFwd;
		this.position.y += Math.sin(this.moveRot)*this.speedFwd;		
	}
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
