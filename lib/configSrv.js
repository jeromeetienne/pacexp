/** @namespace */
var WebyMaze	= WebyMaze || {};

/** @namespace */
WebyMaze.ConfigSrv	= {}


//////////////////////////////////////////////////////////////////////////////////
//		playerSrv							//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.ConfigSrv.playerSrvProd	= {
	controlType	: "cardinalAbsolute",
	//controlType	: "guidedRelative",
	//controlType	: "freeRelative",
	shootEnabled	: false
};

WebyMaze.ConfigSrv.playerSrvDev	= {
	//controlType	: "cardinalAbsolute",
	controlType	: "guidedRelative",
	//controlType	: "freeRelative",
	shootEnabled	: true
};

WebyMaze.ConfigSrv.playerSrv	= WebyMaze.ConfigSrv.playerSrvDev;

//////////////////////////////////////////////////////////////////////////////////
//		gameSrv								//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.ConfigSrv.gameSrvDefaultProd	= {
	nbEnemy			: 4,
	playerPlayerCollision	: false,
	playerEnemyCollision	: true,
	noMorePillsDetection	: true,
	dontBuildPills		: false
};

WebyMaze.ConfigSrv.gameSrvDev	= {
	nbEnemy			: 4,
	playerPlayerCollision	: false,
	playerEnemyCollision	: false,
	noMorePillsDetection	: true,
	dontBuildPills		: false
};

WebyMaze.ConfigSrv.gameSrv	= WebyMaze.ConfigSrv.gameSrvDev;

//////////////////////////////////////////////////////////////////////////////////
//		commonjs exports						//
//////////////////////////////////////////////////////////////////////////////////

// export commonjs module
if( module && module.exports ){
	module.exports	= WebyMaze.ConfigSrv;
}
