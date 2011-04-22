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
	this.enemyType	= opts.enemyType|| console.assert(false);
	this.maze	= opts.maze	|| console.assert(false);
	this.gameSrv	= opts.gameSrv	|| console.assert(false);

	this._energyMax	= 100;
	this._energyCur	= 100;

	this.appearance	= null;
	this.stage	= null;
	this.moveRot	= null;
	
	this.stageTimeout	= null;

	this.setStage('scatter');

	// init syncRotZ
	this._syncRotZ	= new (require('./angleSync.js').SyncTween)({
		origAngle	: this.rotation.z,
		onUpdate	: function(angle){
			this.rotation.z	= angle;
		}.bind(this)
	});
	

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

WebyMaze.EnemySrv.prototype.energyReset	= function(amount)
{
	this._energyCur	= this._energyMax;
}

WebyMaze.EnemySrv.prototype.energyLost	= function(amount)
{
	this._energyCur	-= amount;
	this._energyCur	= Math.max(this._energyCur, 0);
	return this.energyDead();
}

WebyMaze.EnemySrv.prototype.energyDead	= function(){
	return this._energyCur <= 0;
}

//////////////////////////////////////////////////////////////////////////////////
//		misc								//
//////////////////////////////////////////////////////////////////////////////////
/**
 * Called at every tick
*/
WebyMaze.EnemySrv.prototype.tick	= function()
{
	// put this.position on a this.speedFwd grid
	// - it avoid aproximation bug in the wholeSquare computation
	this.position.x	-= this.position.x % this.speedFwd
	this.position.y	-= this.position.y % this.speedFwd

	// wholeSquare is true
	var wholeSquare	= Math.abs(this.position.x % this.maze.tileW) === 0
			&&
		Math.abs(this.position.y % this.maze.tileW) === 0;

	if( wholeSquare ){
		//this.moveRot	= this._cpuNewDirectionRandom();
		this.moveRot	= this._cpuNewDirectionPacman();
		//console.log("moveRot", this.moveRot)
	}


	if( this.moveRot !== null ){
		this.position.x += Math.cos(this.moveRot)*this.speedFwd;
		this.position.y += Math.sin(this.moveRot)*this.speedFwd;		
	}
	
	// set the rotation for the rendering
	this._syncRotZ.sync(this.moveRot)	
}

WebyMaze.EnemySrv.prototype._cpuNewDirectionRandom	= function()
{
	var srcX	= this.maze.space2mapX(this.position.x);
	var srcY	= this.maze.space2mapY(this.position.y);

	if( '_targetTile' in this === false ){
		this._targetTile	= this.maze.findRandomGround();
	}

	// if the target is reached, find a new one
	if( srcX === this._targetTile.x && srcY === this._targetTile.y ){
		this._targetTile	= this.maze.findRandomGround();
	}

	// compute the cardinal direction
	var srcX	= this.maze.space2mapX(this.position.x);
	var srcY	= this.maze.space2mapY(this.position.y);
	var dstX	= this._targetTile.x;
	var dstY	= this._targetTile.y;
	var cardDir	= require('./tmp/mapUtils.js').distMapMazeSrv2ShortestDir(this.maze, srcX, srcY, dstX, dstY);
	////var cardDir	= require('./tmp/mapUtils.js').distMapMazeSrv2ShortestDir(this.maze, this.maze.mapH()-1-srcY, this.maze.mapW()-2-srcX, 1, 1);
//console.log("enemy srcX", srcX, "srcY", srcY)
//console.log("cardDir", cardDir)
//console.log("real spaceX", this.position.x, "spaceY", this.position.y)
//console.log("theo spaceX", this.maze.map2spaceX(srcX), "spaceY", this.maze.map2spaceY(srcY))
//console.assert(false);
	if( cardDir === 'north' )	return this._card2angle['south'];
	else if( cardDir === 'west' )	return this._card2angle['west'];
	else if( cardDir === 'east' )	return this._card2angle['east'];
	else if( cardDir === 'south' )	return this._card2angle['north'];
	else if( cardDir === null )	return null;
	else console.assert(false, "unknown cardinal direction "+cardDir);
}


WebyMaze.EnemySrv.prototype._cpuNewDirectionPacman	= function()
{
	var srcX	= this.maze.space2mapX(this.position.x);
	var srcY	= this.maze.space2mapY(this.position.y);

//if( this.enemyType === 'blinky' )	return null;

	if( this.stage === 'zombie' && srcX === this._zombiePlace.x && srcY === this._zombiePlace.y ){
		this.setStage('chase')
	}
	
	var targetTile	= this._cpuTargetTilePacman();
//console.log("enemyType", this.enemyType, "stage", this.stage, "targetTile", targetTile);

	// compute the cardinal direction
	var curDir	= {
		'east'	: 'east',
		'north'	: 'south',
		'west'	: 'west',
		'south'	: 'north'
	}[this._angle2card[this.moveRot]];
//console.log("curDir", curDir, "moveRot", this.moveRot);


//curDir	= null;

	var MapUtils2	= require('./tmp/mapUtils2.js');
	//var cardDir	= require('./tmp/mapUtils.js').distMapMazeSrv2ShortestDir(this.maze, srcX, srcY, targetTile.x, targetTile.y);
	var cardDir	= MapUtils2.mazeSrv2PacmanDir(this.maze, curDir, srcX, srcY, targetTile.x, targetTile.y);
	
	
	////var cardDir	= require('./tmp/mapUtils.js').distMapMazeSrv2ShortestDir(this.maze, this.maze.mapH()-1-srcY, this.maze.mapW()-2-srcX, 1, 1);
//console.log("enemy srcX", srcX, "srcY", srcY)
//console.log("cardDir", cardDir)
//console.log("real spaceX", this.position.x, "spaceY", this.position.y)
//console.log("theo spaceX", this.maze.map2spaceX(srcX), "spaceY", this.maze.map2spaceY(srcY))
//console.assert(false);
	if( cardDir === 'north' )	return this._card2angle['south'];
	else if( cardDir === 'west' )	return this._card2angle['west'];
	else if( cardDir === 'east' )	return this._card2angle['east'];
	else if( cardDir === 'south' )	return this._card2angle['north'];
	else if( cardDir === null )	return null;
	else console.assert(false, "unknown cardinal direction "+cardDir);
}

WebyMaze.EnemySrv.prototype._card2angle	= {
	east	:  0,
	north	:  Math.PI/2,
	west	:  Math.PI,
	south	:  3*Math.PI/2
};
WebyMaze.EnemySrv.prototype._angle2card	= {}
WebyMaze.EnemySrv.prototype._angle2card[0]		= 'east';
WebyMaze.EnemySrv.prototype._angle2card[Math.PI/2]	= 'north';
WebyMaze.EnemySrv.prototype._angle2card[Math.PI]	= 'west';
WebyMaze.EnemySrv.prototype._angle2card[3*Math.PI/2]	= 'south';
WebyMaze.EnemySrv.prototype._angle2card[-Math.PI/2]	= 'south';

WebyMaze.EnemySrv.prototype._scaterPlaces	= {
	'blinky': { x: -4, y:  2},
	'pinky'	: { x: -4, y: 16},
	'clyde'	: { x: 22, y: 18},
	'inky'	: { x: 22, y:  0}
};
WebyMaze.EnemySrv.prototype._zombiePlace	= {
	x	: 8,
	y	: 9
};

WebyMaze.EnemySrv.prototype._cpuTargetTilePacman	= function()
{
	var srcX	= this.maze.space2mapX(this.position.x);
	var srcY	= this.maze.space2mapY(this.position.y);
	var awayFrom	= {
		'east'	: { x:  1, y:  0},
		'west'	: { x: -1, y: +1},
		'north'	: { x:  0, y: +1},
		'south'	: { x:  0, y: -1}
	};
	var playerSrv	= this.gameSrv.players[Object.keys(this.gameSrv.players)[0]];
	var playerDir	= {
		'east'	: 'south',
		'north'	: 'east',
		'west'	: 'north',
		'south'	: 'west'
	}[this._angle2card[playerSrv.moveRot]];
	playerDir	= this._angle2card[playerSrv.moveRot];
//
//console.log("************************************** ")
//console.log("enemyType", this.enemyType)
//console.log("playerDir moveRot", playerSrv.moveRot)
//console.log("playerDir orig", this._angle2card[playerSrv.moveRot])
//console.log("playerDir convert", playerDir)
	
	
	var playerX	= this.maze.space2mapX(playerSrv.position.x);
	var playerY	= this.maze.space2mapY(playerSrv.position.y);
//console.log("playerSrv", playerSrv)
//console.log("playerX", playerX, "playerY", playerY)

	
	//if( this.enemyType === 'inky' ){
	if( this.stage === 'chase' ){
return this.maze.findRandomGround();
		//return this.maze.findRandomGround();
		if( this.enemyType === 'blinky' ){
			return { x: playerX, y: playerY };
		}else if( this.enemyType === 'pinky' ){
			return { x: playerX + 2*awayFrom[playerDir].x, y: playerY + 2*awayFrom[playerDir].y };
		}else if( this.enemyType === 'inky' ){
			var targetX, targetY
			(function(){
				// find "blinky"
				var blinkyEnemy	= null;
				this.gameSrv.enemies.forEach(function(enemy){
					if( enemy.enemyType !== 'blinky' )	return;
					blinkyEnemy	= enemy;
				})
				var blinkyX	= this.maze.space2mapX(blinkyEnemy.position.x);
				var blinkyY	= this.maze.space2mapY(blinkyEnemy.position.y);
				//console.log("blinkyX", blinkyX, "blinkyY", blinkyY)
				// compute tmp target
				var frontX	= playerX + 1*awayFrom[playerDir].x;
				var frontY	= playerY + 1*awayFrom[playerDir].y;
				//console.log("frontX", frontX, "frontY", frontY)				
				// compute vector
				var vecX	= frontX - blinkyX;
				var vecY	= frontY - blinkyY;
				//console.log("vecX", vecX, "vecY", vecY)				
				// compute the actual target
				targetX	= blinkyX + 2 * vecX;
				targetY	= blinkyY + 2 * vecY;
				//console.log("targetX", targetX, "targetY", targetY)				
			}.bind(this))();
			return { x: targetX, y: targetY };
		}else if( this.enemyType === 'clyde' ){
			var clydePlayerX	= playerX - srcX;
			var clydePlayerY	= playerY - srcY;
			var clydePlayerDist	= Math.sqrt( clydePlayerX*clydePlayerX + clydePlayerY*clydePlayerY );
			if( clydePlayerDist >= 4 )	return { x: playerX, y: playerY }
			return this._scaterPlaces[this.enemyType];
		}else console.assert(false);
	}else if( this.stage === 'scatter' || this.stage === 'chase' ){
		return this._scaterPlaces[this.enemyType];
	}else if( this.stage === 'zombie' ){
		return this._zombiePlace;
	}else if( this.stage === 'frightened' ){
		return this.maze.findRandomGround();
	}else{
		console.assert(false, "unknown stage "+this.stage)
	}
}

/**
 * Change the Stage
*/
WebyMaze.EnemySrv.prototype.setStage	= function(stage)
{
	var type2Color	= {
		blinky	: 'red',
		pinky	: 'pink',
		inky	: 'lightblue',
		clyde	: 'orange'
	};
	var color	= type2Color[this.enemyType];
	console.assert( this.enemyType in type2Color );

	// save the new stage
	this.stage	= stage;
	
	if( stage == "chase" ){
		this.appearance	= "happy-"+color;
		this._timeoutCtor(5*1000, function(){
			this.setStage('scatter');
		}.bind(this));
	}else if( stage == "scatter" ){
		this.appearance	= "happy-"+color;
		this._timeoutCtor(3*1000, function(){
			this.setStage('chase');
		}.bind(this));
	}else if( stage == "frightened" ){
		this.appearance	= "hurt-blue";
		this._timeoutCtor(15*1000, function(){
			this.setStage('chase');
		}.bind(this));
	}else if( stage == "zombie" ){
		this.appearance	= "eyes-white";
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
	if( this._timeoutId ){
		clearTimeout(this._timeoutId)
		this._timeoutId	= null;
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
