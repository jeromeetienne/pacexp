/** @namespace */
var WebyMaze	= WebyMaze || {};

/** @namespace */
WebyMaze.ConfigSrv	= {}

WebyMaze.ConfigSrv.playerSrv	= {
	controlType	: "cardinalAbsolute",
	//controlType	: "guidedRelative",
	//controlType	: "freeRelative",
	shootEnabled	: true
};


WebyMaze.ConfigSrv.gameSrv	= {
	nbEnemy			: 4,
	playerPlayerCollision	: false,
	playerEnemyCollision	: false,
	//noMorePillsDetection	: true,
	//dontBuildPills		: false
	noMorePillsDetection	: false,
	dontBuildPills		: true

};

//////////////////////////////////////////////////////////////////////////////////
//		commonjs exports						//
//////////////////////////////////////////////////////////////////////////////////

// export commonjs module
if( module && module.exports ){
	module.exports	= WebyMaze.ConfigSrv;
}
