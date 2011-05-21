/** @namespace */
var WebyMaze	= WebyMaze || {};

/** @namespace */
WebyMaze.ConfigCli	= {
	sample		: {},
	pacmaze 	: {dev: {}, prod: {}},
	tweetymaze	: {dev: {}, prod: {}}
};

WebyMaze.ConfigCli.PROJECT	= WebyMaze.ConfigProject.PROJECT;
WebyMaze.ConfigCli.ENV		= WebyMaze.ConfigProject.ENV;

//////////////////////////////////////////////////////////////////////////////////
//		webglRender							//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.ConfigCli.sample.webglRender	= {
	/** playerRotation Determine the type of player control */
	playerRotation		: 'free',
	/** firstCameraState the original CameraState when the player join */
	firstCameraState	: 'fixedZenith',
	//playerRotation: 'grid'
	/** minimapEnabled  to enable the minimap */
	minimapEnabled		: true,
	/** showScoreMenu to show the scoreMenuLine */
	showScoreMenu		: true,
	/** showEnergyMenu to show the energyMenuLine */
	showEnergyMenu		: true,
	/** showLifeMenu to show the lifeMenuLine */
	showLifeMenu		: true,
	/** showOptionsMenu to show the optionsMenuLine */
	showOptionsMenu		: true,
	/** showGameIdMenu to show the gameIdMenuLine */
	showGameIdMenu		: true,
	/** showScreenshotMenu to show the screenshotMenuLine */
	showScreenshotMenu	: true,
	/** showSpeakMenu to show the speakMenuLine */
	showSpeakMenu		: true,
	/** showSoundTrackMenu to show the soundTrackMenuLine */
	showSoundTrackMenu	: true,
	/** showSoundFxMenu to show the soundFxMenuLine */
	showSoundFxMenu		: true,
	/** showHelpMenu to show the aboutMenuLine */
	showHelpMenu		: true,
	/** screenshotUploadUrl the url to which upload the screenshot */
	screenshotUploadUrl	: "http://"+location.host+":8084/upload"	
};

WebyMaze.ConfigCli.pacmaze.prod.webglRender	= {
	playerRotation		: 'grid',
	firstCameraState	: 'fixedGrazing',
	minimapEnabled		: false,
	showScoreMenu		: true,
	showEnergyMenu		: false,
	showLifeMenu		: true,
	showOptionsMenu		: true,
	showUsernameMenu	: false,
	showGameIdMenu		: false,
	showScreenshotMenu	: true,
	showSpeakMenu		: true,
	showSoundTrackMenu	: true,
	showSoundFxMenu		: true,
	showHelpMenu		: true,
	screenshotUploadUrl	: "http://"+location.host+":8086/upload"	
};

WebyMaze.ConfigCli.pacmaze.dev.webglRender	= {
	playerRotation		: 'grid',
	firstCameraState	: 'fixedGrazing',
	minimapEnabled		: false,
	showScoreMenu		: true,
	showEnergyMenu		: false,
	showLifeMenu		: true,
	showOptionsMenu		: true,
	showUsernameMenu	: true,
	showGameIdMenu		: true,
	showScreenshotMenu	: true,
	showSpeakMenu		: true,
	showSoundTrackMenu	: true,
	showSoundFxMenu		: true,
	showHelpMenu		: true,
	screenshotUploadUrl	: "http://"+location.host+":8084/upload"	
};



WebyMaze.ConfigCli.tweetymaze.prod.webglRender	= {
	playerRotation		: 'free',
	firstCameraState	: 'inplayer',
	minimapEnabled		: false,
	showScoreMenu		: true,
	showEnergyMenu		: true,
	showLifeMenu		: true,
	showOptionsMenu		: true,
	showUsernameMenu	: true,
	showGameIdMenu		: true,
	showScreenshotMenu	: true,
	showSpeakMenu		: true,
	showSoundTrackMenu	: true,
	showSoundFxMenu		: true,
	showHelpMenu		: true,
	screenshotUploadUrl	: "http://"+location.host+":8087/upload"	
};

WebyMaze.ConfigCli.tweetymaze.dev.webglRender	= {
	playerRotation		: 'free',
	firstCameraState	: 'inplayer',
	minimapEnabled		: false,
	showScoreMenu		: true,
	showEnergyMenu		: true,
	showLifeMenu		: true,
	showOptionsMenu		: true,
	showUsernameMenu	: true,
	showGameIdMenu		: true,
	showScreenshotMenu	: true,
	showSpeakMenu		: true,
	showSoundTrackMenu	: true,
	showSoundFxMenu		: true,
	showHelpMenu		: true,
	screenshotUploadUrl	: "http://"+location.host+":8084/upload"	
};

WebyMaze.ConfigCli.webglRender	= WebyMaze.ConfigCli[WebyMaze.ConfigCli.PROJECT][WebyMaze.ConfigCli.ENV].webglRender;
//WebyMaze.ConfigCli.webglRender	= WebyMaze.ConfigCli['pacmaze']['dev'].webglRender;

//////////////////////////////////////////////////////////////////////////////////
//		ui								//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.ConfigCli.sample.cameraRender	= {
	/** cameraStates stats for the camera */
	cameraStates	: ['overPlayer', 'inplayer', 'facePlayer', 'zenith',
					'behindPlayer', 'fixedZenith', 'fixedGrazing'],
	/** tweenDelay	delay between cameraState change */
	tweenDelay	: 1500
};

WebyMaze.ConfigCli.pacmaze.prod.cameraRender	= {
	cameraStates	: ['fixedZenith', 'fixedGrazing'],
	tweenDelay	: 1500
};

WebyMaze.ConfigCli.pacmaze.dev.cameraRender	= {
	cameraStates	: ['overPlayer', 'inplayer', 'facePlayer', 'zenith',
					'behindPlayer', 'fixedZenith', 'fixedGrazing'],
	tweenDelay	: 1500
};

WebyMaze.ConfigCli.tweetymaze.prod.cameraRender	= {
	cameraStates	: ['inplayer', 'facePlayer'],
	tweenDelay	: 1000
};

WebyMaze.ConfigCli.tweetymaze.dev.cameraRender	= {
	cameraStates	: ['inplayer', 'facePlayer'],
	//cameraStates	: ['overPlayer', 'inplayer', 'facePlayer', 'zenith',
	//				'behindPlayer', 'fixedZenith', 'fixedGrazing'],
	tweenDelay	: 1000
};

WebyMaze.ConfigCli.cameraRender	= WebyMaze.ConfigCli[WebyMaze.ConfigCli.PROJECT][WebyMaze.ConfigCli.ENV].cameraRender;
//WebyMaze.ConfigCli.cameraRender	= WebyMaze.ConfigCli['pacmaze']['dev'].cameraRender;

//////////////////////////////////////////////////////////////////////////////////
//		ui								//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.ConfigCli.sample.client	= {
	/** showStat show webgl performance vuemeter or not */
	showStat	: true,
};

WebyMaze.ConfigCli.pacmaze.prod.client	= {
	showStat	: false,
};

WebyMaze.ConfigCli.pacmaze.dev.client	= {
	showStat	: true
};

WebyMaze.ConfigCli.tweetymaze.prod.client	= {
	showStat	: false
};

WebyMaze.ConfigCli.tweetymaze.dev.client	= {
	showStat	: true
};

WebyMaze.ConfigCli.client	= WebyMaze.ConfigCli[WebyMaze.ConfigCli.PROJECT][WebyMaze.ConfigCli.ENV].client;
//WebyMaze.ConfigCli.client	= WebyMaze.ConfigCli['pacmaze']['dev'].client;

//////////////////////////////////////////////////////////////////////////////////
//		scene								//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.ConfigCli.sample.scene	= {
	/** cameraFov the fov of the camera */
	cameraFov	: 60,
	/** cameraNear the near of the camera */
	cameraNear	: 1,
	/** cameraFar the far of the camera */
	cameraFar	: 2800
};

WebyMaze.ConfigCli.pacmaze.prod.scene	= {
	cameraFov	: 60,
	cameraNear	: 1,
	cameraFar	: 2800
};

WebyMaze.ConfigCli.pacmaze.dev.scene	= {
	cameraFov	: 60,
	cameraNear	: 1,
	cameraFar	: 2800
};

WebyMaze.ConfigCli.tweetymaze.prod.scene	= {
	cameraFov	: 60,
	cameraNear	: 1,
	cameraFar	: 2800
};

WebyMaze.ConfigCli.tweetymaze.dev.scene	= {
	cameraFov	: 60,
	cameraNear	: 1,
	cameraFar	: 2800
};

WebyMaze.ConfigCli.scene	= WebyMaze.ConfigCli[WebyMaze.ConfigCli.PROJECT][WebyMaze.ConfigCli.ENV].scene;
//WebyMaze.ConfigCli.scene	= WebyMaze.ConfigCli['pacmaze']['dev'].scene;


//////////////////////////////////////////////////////////////////////////////////
//		server								//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.ConfigCli.sample.server	= {
	listenHost	: location.hostname,
	listenPort	: 8084
};

WebyMaze.ConfigCli.pacmaze.prod.server	= {
	listenHost	: location.hostname,
	listenPort	: 8086
};

WebyMaze.ConfigCli.pacmaze.dev.server	= {
	listenHost	: location.hostname,
	listenPort	: 8084
};

WebyMaze.ConfigCli.tweetymaze.prod.server	= {
	listenHost	: location.hostname,
	listenPort	: 8087
};

WebyMaze.ConfigCli.tweetymaze.dev.server	= {
	listenHost	: location.hostname,
	listenPort	: 8084
};

WebyMaze.ConfigCli.server	= WebyMaze.ConfigCli[WebyMaze.ConfigCli.PROJECT][WebyMaze.ConfigCli.ENV].server;
//WebyMaze.ConfigCli.server	= WebyMaze.ConfigCli['pacmaze']['dev'].server;

//////////////////////////////////////////////////////////////////////////////////
//		mazeCli								//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.ConfigCli.sample.mazeCli	= {
	/** showRoof true if the roof must be shown */
	showRoof	: true,
	/** wallTextureUrl the url of the texture for wall */
	wallTextureUrl	: 'images/tmp/BluePaintedTiles.png',
	/** groundTextureUrl the url of the texture for ground */
	groundTextureUrl: 'images/tmp/PaddedOrangeWall.png',
	/** wallHRatio the height of a wall compared to its width */
	wallHRatio	: 3/4,
	/** wallShape determine the shape of the wall */
	wallShape	: "cube"
};

WebyMaze.ConfigCli.pacmaze.prod.mazeCli	= {
	showRoof	: false,
	wallTextureUrl	: 'images/tmp/BluePaintedTiles.png',
	groundTextureUrl: 'images/tmp/PaddedOrangeWall.png',
	wallHRatio	: 1/3,
	wallShape	: "cube"
};

WebyMaze.ConfigCli.pacmaze.dev.mazeCli	= {
	showRoof	: false,
	//wallTextureUrl	: 'images/tmp/BluePaintedTiles.png',
	//groundTextureUrl: 'images/tmp/PaddedOrangeWall.png',
	wallTextureUrl	: null,
	groundTextureUrl: null,
	wallHRatio	: 1/3,
	wallShape	: "pyramid"
};

WebyMaze.ConfigCli.tweetymaze.prod.mazeCli	= {
	showRoof	: true,
	wallTextureUrl	: 'images/tmp/BluePaintedTiles.png',
	groundTextureUrl: 'images/tmp/BluePaintedTiles.png',
	wallHRatio	: 4/3,
	wallShape	: "cube"
};

WebyMaze.ConfigCli.tweetymaze.dev.mazeCli	= {
	showRoof	: true,
	//wallTextureUrl	: 'images/tmp/tex0.jpg',
	///wallTextureUrl	: 'images/tmp/PaddedOrangeWall.png',
	wallTextureUrl	: 'images/tmp/BluePaintedTiles.png',
	//wallTextureUrl	: 'images/tmp/GraniteWall.png',
	//goundTextureUrl	: 'images/tmp/tex0.jpg',
	//groundTextureUrl: 'images/tmp/PaddedOrangeWall.png',
	//groundTextureUrl: 'images/tmp/EmbossedWall.png',
	groundTextureUrl: 'images/tmp/BluePaintedTiles.png',
	//groundTextureUrl: 'images/tmp/GraniteWall.png',
	//groundTextureUrl: 'images/textures/TilesOrnate0010_2_thumbhuge.jpg',
	//groundTextureUrl: 'images/textures/MarbleGreen0001_39_thumbhuge.jpg',	
	wallHRatio	: 4/3,
	wallShape	: "cube"
};

WebyMaze.ConfigCli.mazeCli	= WebyMaze.ConfigCli[WebyMaze.ConfigCli.PROJECT][WebyMaze.ConfigCli.ENV].mazeCli;
//WebyMaze.ConfigCli.mazeCli	= WebyMaze.ConfigCli['pacmaze']['dev'].mazeCli;

//////////////////////////////////////////////////////////////////////////////////
//		enemyCli								//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.ConfigCli.sample.enemyCli	= {
	/** object3d the type of object3d to visualize  */
	object3d	: 'ghost'
};

WebyMaze.ConfigCli.pacmaze.prod.enemyCli	= {
	object3d	: 'ghost'
};

WebyMaze.ConfigCli.pacmaze.dev.enemyCli	= {
	object3d	: 'ghost'
};

WebyMaze.ConfigCli.tweetymaze.prod.enemyCli	= {
	object3d	: 'packy'
};

WebyMaze.ConfigCli.tweetymaze.dev.enemyCli	= {
	object3d	: 'packy'
};

WebyMaze.ConfigCli.enemyCli	= WebyMaze.ConfigCli[WebyMaze.ConfigCli.PROJECT][WebyMaze.ConfigCli.ENV].enemyCli;
//WebyMaze.ConfigCli.enemyCli	= WebyMaze.ConfigCli['pacmaze']['dev'].enemyCli;

//////////////////////////////////////////////////////////////////////////////////
//		landingPage							//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.ConfigCli.sample.landingPage	= {
	/** showUsername show usernamer or not */
	showUsername	: true
};

WebyMaze.ConfigCli.pacmaze.prod.landingPage	= {
	showUsername	: false
};

WebyMaze.ConfigCli.pacmaze.dev.landingPage	= {
	showUsername	: false
};

WebyMaze.ConfigCli.tweetymaze.prod.landingPage	= {
	showUsername	: true
};

WebyMaze.ConfigCli.tweetymaze.dev.landingPage	= {
	showUsername	: true
};

WebyMaze.ConfigCli.landingPage	= WebyMaze.ConfigCli[WebyMaze.ConfigCli.PROJECT][WebyMaze.ConfigCli.ENV].landingPage;
//WebyMaze.ConfigCli.landingPage	= WebyMaze.ConfigCli['pacmaze']['dev'].landingPage;

//////////////////////////////////////////////////////////////////////////////////
//		playerCli							//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.ConfigCli.sample.playerCli	= {
	/** forcedAppearanceName force the AppearanceName */
	forcedAppearanceName	: null
};

WebyMaze.ConfigCli.pacmaze.prod.playerCli	= {
	forcedAppearanceName	: "Packy"
};

WebyMaze.ConfigCli.pacmaze.dev.playerCli	= {
	forcedAppearanceName	: "Packy"
};

WebyMaze.ConfigCli.tweetymaze.prod.playerCli	= {
	forcedAppearanceName	: null
};

WebyMaze.ConfigCli.tweetymaze.dev.playerCli	= {
	forcedAppearanceName	: null
};

WebyMaze.ConfigCli.playerCli	= WebyMaze.ConfigCli[WebyMaze.ConfigCli.PROJECT][WebyMaze.ConfigCli.ENV].playerCli;
//WebyMaze.ConfigCli.playerCli	= WebyMaze.ConfigCli['pacmaze']['dev'].playerCli;
