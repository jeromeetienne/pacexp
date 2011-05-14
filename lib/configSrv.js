/** @namespace */
var WebyMaze	= WebyMaze || {};

/** @namespace */
WebyMaze.ConfigSrv	= {
	sample		: {},
	pacmaze 	: {dev: {}, prod: {}},
	tweetymaze	: {dev: {}, prod: {}}
};


var configProject	= require('./configProject');

WebyMaze.ConfigSrv.PROJECT	= configProject.PROJECT;
WebyMaze.ConfigSrv.ENV		= configProject.ENV;

//////////////////////////////////////////////////////////////////////////////////
//		playerSrv							//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.ConfigSrv.sample.playerSrv	= {
	/** controlType
	 * determine how the player reacts to user input
	*/
	controlType	: "cardinalAbsolute",
	//controlType	: "guidedRelative",
	//controlType	: "freeRelative",
	
	/** shootEnabled can the player shoot ? */
	shootEnabled	: false,
	
	/** syncRotZ how the rendered object is rotating to the actual rotation */
	syncRotZ	: 'SyncTween'
};

WebyMaze.ConfigSrv.pacmaze.prod.playerSrv	= {
	controlType	: "cardinalAbsolute",
	shootEnabled	: false,
	syncRotZ	: 'SyncTween'
};

WebyMaze.ConfigSrv.pacmaze.dev.playerSrv	= {
	controlType	: "guidedRelative",
	shootEnabled	: false,
	syncRotZ	: 'SyncTween'
};

WebyMaze.ConfigSrv.tweetymaze.prod.playerSrv	= {
	controlType	: "freeRelative",
	shootEnabled	: true,
	syncRotZ	: 'SyncInstant'	
};

WebyMaze.ConfigSrv.tweetymaze.dev.playerSrv	= {
	controlType	: "freeRelative",
	shootEnabled	: true,
	syncRotZ	: 'SyncInstant'	
};

WebyMaze.ConfigSrv.playerSrv	= WebyMaze.ConfigSrv[WebyMaze.ConfigSrv.PROJECT][WebyMaze.ConfigSrv.ENV].playerSrv;
//WebyMaze.ConfigSrv.playerSrv	= WebyMaze.ConfigSrv['tweetymaze']['dev'].playerSrv;

//////////////////////////////////////////////////////////////////////////////////
//		gameSrv								//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.ConfigSrv.sample.gameSrv	= {
	/** nbEnemy is the number of enemy in the maze */
	nbEnemy			: 4,
	/** playerPlayerCollision can 2 players collide with each other */
	playerPlayerCollision	: false,
	/** playerEnemyCollision can a player collide with an Enemy */
	playerEnemyCollision	: true,
	/** noMorePillsDetection is the game over when there is nomore pills */
	noMorePillsDetection	: true,
	/** dontBuildPills should the pills be built at boot */
	dontBuildPills		: false
};

WebyMaze.ConfigSrv.pacmaze.prod.gameSrv	= {
	nbEnemy			: 4,
	playerPlayerCollision	: false,
	playerEnemyCollision	: true,
	noMorePillsDetection	: true,
	dontBuildPills		: false
};


WebyMaze.ConfigSrv.pacmaze.dev.gameSrv	= {
	nbEnemy			: 4,
	playerPlayerCollision	: false,
	playerEnemyCollision	: false,
	noMorePillsDetection	: true,
	dontBuildPills		: false
};

WebyMaze.ConfigSrv.tweetymaze.prod.gameSrv	= {
	nbEnemy			: 0,
	playerPlayerCollision	: true,
	playerEnemyCollision	: true,
	noMorePillsDetection	: false,
	dontBuildPills		: false
};

WebyMaze.ConfigSrv.tweetymaze.dev.gameSrv	= {
	nbEnemy			: 4,
	playerPlayerCollision	: true,
	playerEnemyCollision	: true,
	noMorePillsDetection	: false,
	dontBuildPills		: false
};

WebyMaze.ConfigSrv.gameSrv	= WebyMaze.ConfigSrv[WebyMaze.ConfigSrv.PROJECT][WebyMaze.ConfigSrv.ENV].gameSrv;
//WebyMaze.ConfigSrv.gameSrv	= WebyMaze.ConfigSrv['pacmaze']['dev'].gameSrv;

//////////////////////////////////////////////////////////////////////////////////
//		mazeSrv								//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.ConfigSrv.sample.mazeSrv	= {
	/** mapType the type of map */
	mapType		: 'pacman1',
	/** dontBuildPills true if you dont want to autofill the maze with pills */
	dontFillPills	: false
};

WebyMaze.ConfigSrv.pacmaze.prod.mazeSrv	= {
	mapType		: 'pacman1',
	dontFillPills	: false
};

WebyMaze.ConfigSrv.pacmaze.dev.mazeSrv	= {
	mapType		: 'pacman1',
	dontFillPills	: false
};

WebyMaze.ConfigSrv.tweetymaze.prod.mazeSrv	= {
	mapType		: 'tweetymaze',
	dontFillPills	: true
};

WebyMaze.ConfigSrv.tweetymaze.dev.mazeSrv	= {
	mapType		: 'tweetymaze',
	dontFillPills	: true
};

WebyMaze.ConfigSrv.mazeSrv	= WebyMaze.ConfigSrv[WebyMaze.ConfigSrv.PROJECT][WebyMaze.ConfigSrv.ENV].mazeSrv;
//WebyMaze.ConfigSrv.mazeSrv	= WebyMaze.ConfigSrv['tweetymaze']['dev'].mazeSrv;

//////////////////////////////////////////////////////////////////////////////////
//		server								//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.ConfigSrv.sample.server	= {
	/** onePlayerPerGameId to be sure only one player per Game */
	onePlayerPerGameId	: false,
	listenPort		: 8080,
};

WebyMaze.ConfigSrv.pacmaze.prod.server	= {
	onePlayerPerGameId	: true,
	listenPort		: 8086
};

WebyMaze.ConfigSrv.pacmaze.dev.server	= {
	onePlayerPerGameId	: false,
	listenPort		: 8084
};

WebyMaze.ConfigSrv.tweetymaze.prod.server	= {
	onePlayerPerGameId	: false,
	listenPort		: 8087
};

WebyMaze.ConfigSrv.tweetymaze.dev.server	= {
	onePlayerPerGameId	: false,
	listenPort		: 8084
};

WebyMaze.ConfigSrv.server	= WebyMaze.ConfigSrv[WebyMaze.ConfigSrv.PROJECT][WebyMaze.ConfigSrv.ENV].server;
//WebyMaze.ConfigSrv.server	= WebyMaze.ConfigSrv['tweetymaze']['dev'].server;


//////////////////////////////////////////////////////////////////////////////////
//		commonjs exports						//
//////////////////////////////////////////////////////////////////////////////////

// export commonjs module
if( module && module.exports ){
	module.exports	= WebyMaze.ConfigSrv;
}
