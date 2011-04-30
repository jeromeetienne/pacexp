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
	/** firstCameraState the original firstCameraState when the player join */
	firstCameraState	: 'fixedZenith',
	//playerRotation: 'grid'
	/** minimapEnabled  to enable the minimap */
	minimapEnabled		: true,
	/** showUsernameMenu to show the usernameMenuLine */
	showUsernameMenu	: true,
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
	/** showAboutMenu to show the aboutMenuLine */
	showAboutMenu		: true,
	/** showAboutDialogOnLaunch to show the aboutDialog when the app launch */
	showAboutDialogOnLaunch	: true,
	/** screenshotUploadUrl the url to which upload the screenshot */
	screenshotUploadUrl	: "http://"+location.host+":8084/upload"	
};

WebyMaze.ConfigCli.pacmaze.prod.webglRender	= {
	playerRotation		: 'grid',
	firstCameraState	: 'fixedZenith',
	minimapEnabled		: false,
	showUsernameMenu	: true,
	showGameIdMenu		: false,
	showScreenshotMenu	: true,
	showSpeakMenu		: true,
	showSoundTrackMenu	: true,
	showSoundFxMenu		: true,
	showAboutMenu		: true,
	showAboutDialogOnLaunch	: true,
	screenshotUploadUrl	: "http://"+location.host+":8084/upload"	
};

WebyMaze.ConfigCli.pacmaze.dev.webglRender	= {
	playerRotation		: 'grid',
	firstCameraState	: 'fixedZenith',
	minimapEnabled		: false,
	showUsernameMenu	: true,
	showGameIdMenu		: true,
	showScreenshotMenu	: true,
	showSpeakMenu		: true,
	showSoundTrackMenu	: true,
	showSoundFxMenu		: true,
	showAboutMenu		: true,
	showAboutDialogOnLaunch	: false,
	screenshotUploadUrl	: "http://"+location.host+":8084/upload"	
};



WebyMaze.ConfigCli.tweetymaze.prod.webglRender	= {
	playerRotation		: 'free',
	firstCameraState	: 'inplayer',
	minimapEnabled		: false,
	showUsernameMenu	: true,
	showGameIdMenu		: true,
	showScreenshotMenu	: true,
	showSpeakMenu		: true,
	showSoundTrackMenu	: true,
	showSoundFxMenu		: true,
	showAboutMenu		: true,
	showAboutDialogOnLaunch	: false,
	screenshotUploadUrl	: "http://"+location.host+":8085/upload"	
};

WebyMaze.ConfigCli.tweetymaze.dev.webglRender	= {
	playerRotation		: 'free',
	firstCameraState	: 'inplayer',
	minimapEnabled		: false,
	showUsernameMenu	: true,
	showGameIdMenu		: true,
	showScreenshotMenu	: true,
	showSpeakMenu		: true,
	showSoundTrackMenu	: true,
	showSoundFxMenu		: true,
	showAboutMenu		: true,
	showAboutDialogOnLaunch	: false,
	screenshotUploadUrl	: "http://"+location.host+":8084/upload"	
};

WebyMaze.ConfigCli.webglRender	= WebyMaze.ConfigCli[WebyMaze.ConfigCli.PROJECT][WebyMaze.ConfigCli.ENV].webglRender;
//WebyMaze.ConfigCli.webglRender	= WebyMaze.ConfigCli['pacmaze']['dev'].webglRender;

console.log("super configcli", WebyMaze.ConfigCli.webglRender);

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
	listenPort	: 8084
};

WebyMaze.ConfigCli.pacmaze.dev.server	= {
	listenHost	: location.hostname,
	listenPort	: 8084
};

WebyMaze.ConfigCli.tweetymaze.prod.server	= {
	listenHost	: location.hostname,
	listenPort	: 8085
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
	wallHRatio	: 3/4
};

WebyMaze.ConfigCli.pacmaze.prod.mazeCli	= {
	showRoof	: false,
	wallTextureUrl	: 'images/tmp/BluePaintedTiles.png',
	groundTextureUrl: 'images/tmp/PaddedOrangeWall.png',
	wallHRatio	: 1/3
};

WebyMaze.ConfigCli.pacmaze.dev.mazeCli	= {
	showRoof	: false,
	wallTextureUrl	: 'images/tmp/BluePaintedTiles.png',
	groundTextureUrl: 'images/tmp/PaddedOrangeWall.png',
	wallHRatio	: 1/3
};

WebyMaze.ConfigCli.tweetymaze.prod.mazeCli	= {
	showRoof	: true,
	wallTextureUrl	: 'images/tmp/tex0.jpg',
	groundTextureUrl: 'images/tmp/EmbossedWall.png',
	wallHRatio	: 15/3
};

WebyMaze.ConfigCli.tweetymaze.dev.mazeCli	= {
	showRoof	: true,
	wallTextureUrl	: 'images/tmp/tex0.jpg',
	//wallTextureUrl	: 'images/tmp/PaddedOrangeWall.png',
	groundTextureUrl: 'images/tmp/PaddedOrangeWall.png',
	//groundTextureUrl: 'images/tmp/EmbossedWall.png',
	//groundTextureUrl: 'images/tmp/BluePaintedTiles.png',
	wallHRatio	: 4/3
};

WebyMaze.ConfigCli.mazeCli	= WebyMaze.ConfigCli[WebyMaze.ConfigCli.PROJECT][WebyMaze.ConfigCli.ENV].mazeCli;
//WebyMaze.ConfigCli.mazeCli	= WebyMaze.ConfigCli['pacmaze']['dev'].mazeCli;
