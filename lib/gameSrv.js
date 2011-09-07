/**
 * 
*/

/** @namespace */
var WebyMaze	= WebyMaze || {};

var MazeSrv	= require('./mazeSrv');
var PlayerSrv	= require('./playerSrv');
var EnemySrv	= require('./enemySrv');
var ShootSrv	= require('./shootSrv');
var PillSrv	= require('./pillSrv');

//////////////////////////////////////////////////////////////////////////////////
//		ctor/dtor							//
//////////////////////////////////////////////////////////////////////////////////

/**
 * Handle the game at the server level
 *
 * @constructor
*/
WebyMaze.GameSrv	= function(opts)
{
	// get values from opts
	this.gameId	= opts.gameId		|| console.assert(false);
	this.gameTitle	= opts.gameTitle	|| console.assert(false);
	this._levelIdx	= ('levelIdx' in opts) ? opts.levelIdx : console.assert(false);
	
	this.mazeSrv	= new MazeSrv({
		levelIdx	: this._levelIdx
	});
	this.players	= [];	// change this in {} with playerId key
	this.enemies	= [];	// change this in {} with enemyId key
	this.shoots	= [];	// change this in {} with shootId key
	this.pills	= [];	// change this in {} with pillId key
	this.tickEvents	= [];
	
	this.lastRenderInfoFull	= {
		players	: { add: {} },
		enemies	: { add: {} },
		shoots	: { add: {} },
		pills	: { add: {} }
	};

	// load local ConfigSrv
	this._config	= require('./configSrv').gameSrv;


	console.log("Creating game.", "gameId:", this.gameId, "gameTitle:", this.gameTitle)
	
	// init loop delay
	this._baseDelay		= 1/60 * 1000;
	this._loopDelay		= 1/60 * 1000;
	this._tickfirstDate	= Date.now();
	this._tickLastDate	= null;
	this._timeoutId	= setInterval(function(){
		var present	= Date.now();
		if( this._tickLastDate ){
			var deltaTime	= present - this._tickLastDate;
		}else{
			var deltaTime	= this._loopDelay;
		}
		this._tickLastDate	= present;
		this.tick({
			totalTime	: present - this._tickfirstDate,
			deltaTime	: deltaTime,
			nQuantum	: 1	//deltaTime / this._baseDelay
		});
	}.bind(this), this._loopDelay)

	// put the pills in the map
	this._pillsCtor();
	this._enemiesCtor();
}

WebyMaze.GameSrv.prototype.destroy	= function(){
	// stop loop delay
	if( this._timeoutId )	clearInterval(this._timeoutId)
	
	// TODO destroy() of players
	// and others. you need clean code
	
	this._enemiesDtor();
	this._pillsDtor();
}

require('./microevent').mixin(WebyMaze.GameSrv)

//////////////////////////////////////////////////////////////////////////////////
//		enemies ctor/dtor						//
//////////////////////////////////////////////////////////////////////////////////

/**
 * Put the enemies in the map
*/
WebyMaze.GameSrv.prototype._enemiesCtor		= function()
{
	var nbEnemy	= require('./configSrv').gameSrv.nbEnemy;
	var enemyTypes	= ['blinky', 'pinky', 'inky', 'clyde'];
	var mapPosType	= {
		blinky	: {x: 9, y: 9},
		pinky	: {x: 10, y: 7},
		inky	: {x: 10, y: 9},
		clyde	: {x: 10, y: 8}
	}
	for( var i = 0; i < nbEnemy; i ++){
		var enemyType	= enemyTypes[i % enemyTypes.length]
		// find a random position
		var mapPos	= this.mazeSrv.findRandomGround();
		mapPos	= mapPosType[enemyType];
		// create the enemy
		var enemy	= new EnemySrv({
			position	: {
				x	: this.mazeSrv.map2spaceX(mapPos.x),
				y	: this.mazeSrv.map2spaceY(mapPos.y)
			},
			enemyType	: enemyType,
			rotation	: {
				z	: 0
			},
			maze		: this.mazeSrv,
			gameSrv		: this
		});
		enemy.bind('changeStage', function(newStage, oldStage){
			console.log("enemy changstage from ", oldStage,"to", newStage)
			// process to stop the emergency state after an eatEnergizer
			if( oldStage === 'frightened' ){
				var nFrightened	= 0;
				this.enemies.forEach(function(enemy){
					if( enemy.getStage() === 'frightened' ){
						nFrightened++;
					}
				})
				console.log("nFrightened", nFrightened)
				if( nFrightened == 0 ){
					// reset _enemyLastKilledScore
					this._enemyLastKilledScore	= 0;
					// stop the emergency effect
					this._tickEventSoundStop('siren');
					this.tickEvents.push({
						type	: 'setLighting',
						data	: this.mazeSrv.getLightingDfl()
					});					
				}
			}
		}.bind(this))
		// add enemy to this.enemies
		this.enemies.push(enemy);
	}
}

WebyMaze.GameSrv.prototype._enemiesDtor		= function()
{
	// destroy all enemies
	this.enemies.forEach(function(enemy){	enemy.destroy();	})
	this.enemies	= [];
}

//////////////////////////////////////////////////////////////////////////////////
//		pills ctor/dtor							//
//////////////////////////////////////////////////////////////////////////////////

/**
 * Put the pills in the map
*/
WebyMaze.GameSrv.prototype._pillsCtor		= function()
{
	// honor this._config
	if( this._config.dontBuildPills )	return; 

	var mazeH	= this.mazeSrv.mapH();
	var mazeW	= this.mazeSrv.mapW();
	var tileW	= this.mazeSrv.tileW;

	this.mazeSrv.forEach(function(mazeX, mazeY){
		var tileValue	= this.mazeSrv.tileValue(mazeX,mazeY);
	//console.log("mazeX", mazeX, "mazeY", mazeY)
		if( MazeSrv.isPillChar(tileValue) === false )	return;
		
		this.pills.push(new PillSrv({
			position	: {
				x	: ( mazeX - Math.floor(mazeW/2) ) * tileW,
				y	: ( mazeY - Math.floor(mazeH/2) ) * tileW,
				//x	: mazeX * bodyW + bodyW/2 - mazeW*bodyW/2,
				//y	: mazeY * bodyW + bodyW/2 - mazeH*bodyW/2,
				z	: 0
			},
			rotation	: { x: 0, y: 0, z: 0 },
			pillType	: MazeSrv.PillType(tileValue)
		}))
	}.bind(this))

	console.log("nb pills", this.pills.length)
}

WebyMaze.GameSrv.prototype._pillsDtor		= function()
{
	// destroy all pills
	this.pills.forEach(function(pill){	pill.destroy();	})
	this.pills	= [];
}

//////////////////////////////////////////////////////////////////////////////////
//		misc								//
//////////////////////////////////////////////////////////////////////////////////

/**
 * This will destroy the object. dont run anything after this function
*/
WebyMaze.GameSrv.prototype.triggerGameCompleted	= function(reason)
{
	// send message to all players
	this._playersBroadcast({
		type	: "gameCompleted",
		data	: {
			reason	: reason
		}
	});
	// tigger a local gameover
	this.trigger("gameCompleted", { reason: reason });
}

/**
 * Handle the tick
*/
WebyMaze.GameSrv.prototype.tick		= function(timings){
	var collisionUtils	= require('./collisionUtils')

	// sanity check - this.tickEvents MUST be [] now
	//console.assert( this.tickEvents.length === 0 );


	// tick everybody
	this.players.forEach(function(player){
		player.tick(timings);
	}.bind(this))
	this.enemies.forEach(function(enemy){
		enemy.tick(timings);
	}.bind(this))
	this.shoots.forEach(function(shoot){
		shoot.tick(timings);
	}.bind(this))
	this.pills.forEach(function(pill){
		pill.tick(timings);
	}.bind(this))


	// handle player-map collision
	this.players.forEach(function(player){
		var collision	= collisionUtils.collideMaze(player.position, player.bodyW, this.mazeSrv);
		if( !collision )	return;
	}.bind(this));

	// handle player-player collision
	this.players.forEach(function(player1, i){
		// to disable collision between player
		if( this._config.playerPlayerCollision === false )	return;
		// find a possible other player
		this.players.slice(i+1).forEach(function(player2){
			var collision	= collisionUtils.collideSphere(player1.position, player1.bodyW, player2.position, player2.bodyW);
			//console.log("playerplayer", collision)
			if( !collision )	return;
		}.bind(this));
	}.bind(this));

	// handle player-enemy collision
	this.players.forEach(function(player){
		this.enemies.forEach(function(enemy){
			// to disable collision between player
			if( this._config.playerEnemyCollision === false ){
				if( enemy.stage == 'chase' || enemy.stage == 'scatter')	return;
			}
			// no collision when enemy.stage == "zombie"
			if( enemy.stage === "zombie" )	return;
			
			// compute the collision			
			var collision	= collisionUtils.collideSphere(player.position, player.bodyW, enemy.position, enemy.bodyW);
			if( !collision )	return;

			console.log("playerEnemy", collision)
			console.log("stage", enemy.stage)	

			if( enemy.stage == 'chase' || enemy.stage == 'scatter' ){
				this._playersKill(player);
			}else if( enemy.stage === 'frightened' ){
				// compute score for this kill
				var score	= this._enemyLastKilledScore ? this._enemyLastKilledScore * 2 : 200;
				this._enemyLastKilledScore	= score;
				
				var caption	= score.toString();
				if( score <= 400 )	caption	+= "!!";
				else if( score <= 800 )	caption	+= "!!!";
				else 			caption	+= "!!!!";
				
				// add the score to the player
				player.scoreAdd(score)
				enemy.setStage('zombie')
				this._tickEventPlaySound('eatGhost');
				// put a caption above this enemy
				this._tickEventShowVisualFx('caption', {
					textData	: caption,
					position	: {
						bodyId	: enemy.getBodyId()
						//x	: 0,
						//y	: 0
					}				
				});
			}
		}.bind(this));
	}.bind(this))

	// handle player-shoot collision
	this.players.forEach(function(player){
		this.shoots.forEach(function(shoot){
			var collision	= collisionUtils.collideSphere(player.position, player.bodyW, shoot.position, shoot.bodyW);
			if( !collision )	return;
			// notify the player of the collision
			player.dammageSuffered(10);

			// score when a player hit a enemy
			var srcBodyId	= shoot.srcBodyId();
			var srcPlayer	= this._playerFind(srcBodyId);
			srcPlayer.scoreAdd(20)

			if( player.dammageLethal() ){
				srcPlayer.scoreAdd(100)

				// notify every user
				this._playersNotify(srcPlayer.getUsername()+' just killed '+player.getUsername());
			}

		}.bind(this));
	}.bind(this))
	
	// handle player-pill collision
	this.players.forEach(function(player, i){
		this.pills.forEach(function(pill){
			var collision	= collisionUtils.collideSphere(player.position, player.bodyW, pill.position, pill.bodyW);
			if( !collision )	return;
			// TODO here collision happened

			// notify the player of the collision
			player.collidePill(pill);

			// pill.pillType is 'red' then pass all enemies in 'frightened'
			if( pill.pillType === 'red' ){
				this.enemies.forEach(function(enemy){
					enemy.setStage('frightened')
				})
				this._tickEventPlaySound('eatEnergizer');

				this._tickEventPlaySound('siren', {loops: 9999});
				this.tickEvents.push({
					type	: 'setLighting',
					data	: 'emergency'
				});
			}else{
				this._tickEventPlaySound('eatPill');
			}
		
			// delete this PillSrv
			pill.destroy();
			this.pills.splice(this.pills.indexOf(pill), 1);			
		}.bind(this));
	}.bind(this))

	// if there is no more pills, notify a gameover
	if( this.pills.length === 0 && this._config.noMorePillsDetection ){
		this.triggerGameCompleted("noMorePills")
		return;
	}

	// handle shoot-map collision
	this.shoots.forEach(function(shoot){
		var collision	= collisionUtils.collideMaze(shoot.position, shoot.bodyW, this.mazeSrv)
		if( !collision )	return;
		// queue an event in the tickEvent
		this._tickEventShowVisualFx('impact', {
			position	: shoot.position					
		});
		// destroy this shoot
		shoot.destroy();
		this.shoots.splice(this.shoots.indexOf(shoot), 1);
	}.bind(this))


	// handle enemy-map collision
	this.enemies.forEach(function(enemy){
		var collision	= collisionUtils.collideMaze(enemy.position, enemy.bodyW, this.mazeSrv)
		if( !collision )	return;
	}.bind(this))

	// handle enemy-shoot collision
	this.enemies.forEach(function(enemy){
		this.shoots.forEach(function(shoot){
			var collision	= collisionUtils.collideSphere(enemy.position, enemy.bodyW, shoot.position, shoot.bodyW);
			if( !collision )	return;
			// notify the player of the collision
			// TODO who has the point ?
			// - add player in the shoot player.scoreAdd(200)
			

			// score when a player hit a enemy
			var srcBodyId	= shoot.srcBodyId();
			var srcPlayer	= this._playerFind(srcBodyId);
			srcPlayer.scoreAdd(20)

			// queue an event in the tickEvent
			this._tickEventShowVisualFx('impact', {
				position	: shoot.position					
			});
			// make the enemy loses some energy
			enemy.energyLost(50);
			// if the enemy is dead, setStage to 'zombie'
			if( enemy.energyDead() ){
				// score when a player kill an enemy
				srcPlayer.scoreAdd(20)

				enemy.energyReset();
				enemy.setStage('zombie')
				this._tickEventPlaySound('eatGhost');

				// notify every user
				this._playersNotify(srcPlayer.getUsername()+' just killed '+enemy.getEnemyType());
			}
			// destroy this shoot
			shoot.destroy();
			this.shoots.splice(this.shoots.indexOf(shoot), 1);
		}.bind(this));
	}.bind(this))

	// remove the dead players
	this.players.forEach(function(player){
		// TODO super dirty
		if( player.dammageLethal() ){
			console.log("triggering dead on", player.username)
			player.trigger('dead');
		}
	}.bind(this));

	// send the contextTick
	this._playersBroadcast({
		type	: "contextTick",
		data	: this._buildContextTick(timings)
	})
	// reset this.tickEvents
	this.tickEvents		= [];

	// if there is no more player, notify a gameover
	if( this.players.length === 0 ){
		this.triggerGameCompleted("no more players")
		return;
	}
}


WebyMaze.GameSrv.prototype._tickEventPlaySound	= function(fxId, opts)
{
	this.tickEvents.push({
		type	: 'soundStart',
		data	: {
			fxId	: fxId,
			opts	: opts
		}
	});
}

WebyMaze.GameSrv.prototype._tickEventShowVisualFx	= function(type, data)
{
	this.tickEvents.push({
		type	: 'showVisualFx',
		data	: {
			type	: type,
			data	: data
		}
	});
}

WebyMaze.GameSrv.prototype._tickEventSoundStop	= function(fxId)
{
	this.tickEvents.push({
		type	: 'soundStop',
		data	: {
			fxId	: fxId
		}
	});
}

//////////////////////////////////////////////////////////////////////////////////
//		misc								//
//////////////////////////////////////////////////////////////////////////////////

/**
 * add a player into this game
 *
 * @param gameReq the game request from the player
 * @param ioClient the socket.io client for this player
*/
WebyMaze.GameSrv.prototype.playerAdd	= function(gameReq, ioClient){
	// get data from gameReq
	var username	= gameReq.username;
	if( !username )	username	= this._playersBuildUsername();
	// create a player
	var player	= new PlayerSrv({
		score		: gameReq.playerScore,
		username	: username,
		ioClient	: ioClient,
		maze		: this.mazeSrv,
		position	: {
			x	: 1,
			y	: 0
		},
		rotation	: {
			z	: 0
			//z	: Math.PI
		}
	})

	// bind events in the just-created player	
	player.bind('disconnect', function(){
		console.log("received disconect on", player.username)
		this._playersNotify(player.getUsername()+' just left.');
		this._playersKill(player);
	}.bind(this));
	
	// bind events in the just-created player	
	player.bind('dead', function(){
		console.log("received dead on", player.username)
		this._playersKill(player);
	}.bind(this));

	player.bind('shoot', function(){
		var dist	= (player.bodyW+ShootSrv.bodyW)/2;
		var shoot	= new ShootSrv({
			srcBodyId	: player.bodyId,
			position	: {
				x	: player.position.x + Math.cos(player.moveRot)*dist,
				y	: player.position.y + Math.sin(player.moveRot)*dist
			},
			rotation	: {
				z	: player.moveRot
			}
		});
		shoot.bind('autodestroy', function(){
			// destroy this shoot
			shoot.destroy();
			this.shoots.splice(this.shoots.indexOf(shoot), 1);			
		}.bind(this))
		this.shoots.push(shoot);
	}.bind(this));
	
	player.bind('userMessage', function(data){
		console.log("userMessage", data);
		this._playersBroadcast({
			type	: 'notification',
			data	: data
		})
	}.bind(this));
	
	player.bind('changeUsername', function(data){
		this._playersNotify(data.oldValue+' is now '+data.newValue);
	}.bind(this));

	// queue this player
	this.players.push(player);

	// notify everybody of the join
	this._playersNotify( player.getUsername()+' just joined.');

	// send the static context
	player.ioClient.send(JSON.stringify({
		type	: "contextInit",
		data	: this._buildContextInit(player)
	}));
}

WebyMaze.GameSrv.prototype._playersKill	= function(player)
{
	// send a gameCompleted message
	player.ioClient.send(JSON.stringify({
		type	: "gameCompleted",
		data	: {
			reason	: "playerKilled"
		}
	}));
	// log to debug
	console.log("killed player", player.username,"nb player", this.players.length)
	// destroy the player now
	player.destroy();
	this.players.splice(this.players.indexOf(player), 1);
}

/**
 * Send a message to all players
*/
WebyMaze.GameSrv.prototype._playersBroadcast	= function(message)
{
	this.players.forEach(function(player){		
		player.ioClient.send(JSON.stringify(message));
	});
}

/**
 * Send a message to all players
*/
WebyMaze.GameSrv.prototype._playersNotify	= function(text)
{
	this._playersBroadcast({
		type	: 'notification',
		data	: {
			createdAt	: Date.now(),
			text		: text
		}			
	})
}

WebyMaze.GameSrv.prototype._playersDtor		= function()
{
	// destroy all players
	this.players.forEach(function(player){	player.destroy();	})
	this.players	= [];
}

WebyMaze.GameSrv.prototype._playerFind	= function(bodyId)
{
	var result	= this.players.filter(function(player){
		return bodyId === player.bodyId;
	})
	return result.length === 0 ? null : result[0];
}

/**
 * Generate a guest username. Used when the player got no specific name
*/
WebyMaze.GameSrv.prototype._playersBuildUsername	= function()
{
	var nGuests	= 0;
	this.players.forEach(function(player){
		if( player.username.match(/^guest/) ){
			nGuests++;
		}
	})
	if( nGuests )	return "guest-"+(nGuests+1);
	return 'guest'
}

//////////////////////////////////////////////////////////////////////////////////
//		ContextInit/ContextTick						//
//////////////////////////////////////////////////////////////////////////////////

/**
 * Build a context init
 *
 * @param dstPlayer the player for whose it is destined
 * @returns {Object} the context init
*/
WebyMaze.GameSrv.prototype._buildContextInit	= function(dstPlayer)
{
	return {
		// info about the game itself
		gameId		: this.gameId,
		gameTitle	: this.gameTitle,
		// the map
		map		: this.mazeSrv.getMap(),
		mapLightingDfl	: this.mazeSrv.getLightingDfl(),
		renderInfoFull	: this.lastRenderInfoFull,
		// info about the player
		urBodyId	: dstPlayer.bodyId,
		username	: dstPlayer.username
	}
}

/** Build a context tick */
WebyMaze.GameSrv.prototype._buildContextTick	= function(timings){
	return {
		timings	: timings,
		events	: this.tickEvents,
		players	: this._renderInfoPlayer(),
		enemies	: this._renderInfoEnemy(),
		shoots	: this._renderInfoShoot(),
		pills	: this._renderInfoPill()
	};
}

WebyMaze.GameSrv.prototype._renderInfoPlayer	= function()
{
	// TODO find better name
	var collection		= this.players;
	var lastFull		= this.lastRenderInfoFull.players;
	return this._renderInfoDiff(collection, lastFull)
}

WebyMaze.GameSrv.prototype._renderInfoEnemy	= function()
{
	// TODO find better name
	var collection		= this.enemies;
	var lastFull		= this.lastRenderInfoFull.enemies;
	return this._renderInfoDiff(collection, lastFull)
}

WebyMaze.GameSrv.prototype._renderInfoShoot	= function(){
	// TODO find better name
	var collection		= this.shoots;
	var lastFull		= this.lastRenderInfoFull.shoots;
	return this._renderInfoDiff(collection, lastFull)
}

WebyMaze.GameSrv.prototype._renderInfoPill = function(){
	// TODO find better name
	var collection		= this.pills;
	var lastFull		= this.lastRenderInfoFull.pills;
	return this._renderInfoDiff(collection, lastFull)
}

/**
 * @returns {Object} a renderInfo diff
*/
WebyMaze.GameSrv.prototype._renderInfoDiff	= function(collection, lastFull){
	// create an empty Render Info
	var curRenderInfo	= {
		add	: {},
		upd	: {},
		del	: []
	};

	collection.forEach(function(body){
		var bodyId	= body.bodyId;
		var oldFull	= lastFull.add[bodyId];
		var curFull	= body.renderInfoFull();
		// if not yet created, put it lastFull.add + curRenderInfo.add 
		var created	= bodyId in lastFull.add;
		if( !created ){
			curRenderInfo.add[bodyId]	= curFull;
		}else if( body.renderInfoEqual(oldFull, curFull) === false ){
			// if already created and curFull != from lastFull, put it in curRenderInfo.upd
			curRenderInfo.upd[bodyId]	= curFull;
		}
		// update lastFull
		lastFull.add[bodyId]		= curFull;
	}.bind(this));

	// remove the obsolete bodies - aka present in lastFull.add and not in collection
	// TODO in fact curRenderInfo.del should be an array as it is a list of bodyId
	Object.keys(lastFull.add).forEach(function(bodyId){
		// if this bodyid is in collection, return now
		for(var i = 0; i < collection.length; i++){
			var body	= collection[i];
			if( bodyId === body.bodyId ) return;
		}
		// put this bodyId in curRenderInfo.del
		curRenderInfo.del.push(bodyId);
		delete lastFull.add[bodyId];
	}.bind(this));
	
	// remove empty .add/.upd/.del
	if( Object.keys(curRenderInfo.add).length === 0 )	delete curRenderInfo.add;
	if( Object.keys(curRenderInfo.upd).length === 0 )	delete curRenderInfo.upd;
	if( curRenderInfo.del.length === 0 )			delete curRenderInfo.del;

	// if curRenderInfo is empty, set it to null;
	if( Object.keys(curRenderInfo).length === 0 )		curRenderInfo	= null;

	// log to debug
	//if( curRenderInfo )	console.log("curRenderInfo", JSON.stringify(curRenderInfo))
	
	// return the just-built curRenderInfo
	return curRenderInfo;
}
	


//////////////////////////////////////////////////////////////////////////////////
//		commonjs							//
//////////////////////////////////////////////////////////////////////////////////

// export commonjs module
if( module && module.exports ){
	module.exports	= WebyMaze.GameSrv;
}


