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
	//playerRotation: 'grid'
	/** minimapEnabled  to enable the minimap */
	minimapEnabled		: true,
	/** showUsernameMenu to show the usernameMenuLine */
	showUsernameMenu	: true,
	/** showGameIdMenu to show the gameIdMenuLine */
	showGameIdMenu		: true,
	/** showScreenshotMenu to show the screenshotMenuLine */
	showScreenshotMenu	: true,
	/** showSoundTrackMenu to show the soundTrackMenuLine */
	showSoundTrackMenu	: true,
	/** showSoundFxMenu to show the soundFxMenuLine */
	showSoundFxMenu		: true,
	/** showAboutMenu to show the aboutMenuLine */
	showAboutMenu		: true,
	/** showAboutDialogOnLaunch to show the aboutDialog when the app launch */
	showAboutDialogOnLaunch	: true
};

WebyMaze.ConfigCli.pacmaze.prod.webglRender	= {
	playerRotation		: 'grid',
	minimapEnabled		: false,
	showUsernameMenu	: false,
	showGameIdMenu		: false,
	showScreenshotMenu	: false,
	showSoundTrackMenu	: true,
	showSoundFxMenu		: true,
	showAboutMenu		: true,
	showAboutDialogOnLaunch	: true
};

WebyMaze.ConfigCli.pacmaze.dev.webglRender	= {
	playerRotation		: 'grid',
	minimapEnabled		: false,
	showUsernameMenu	: true,
	showGameIdMenu		: true,
	showScreenshotMenu	: true,
	showSoundTrackMenu	: true,
	showSoundFxMenu		: true,
	showAboutMenu		: true,
	showAboutDialogOnLaunch	: false
};

WebyMaze.ConfigCli.tweetymaze.dev.webglRender	= {
	playerRotation		: 'free',
	minimapEnabled		: false,
	showUsernameMenu	: true,
	showGameIdMenu		: true,
	showScreenshotMenu	: true,
	showSoundTrackMenu	: true,
	showSoundFxMenu		: true,
	showAboutMenu		: true,
	showAboutDialogOnLaunch	: false
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

WebyMaze.ConfigCli.tweetymaze.dev.server	= {
	listenHost	: location.hostname,
	listenPort	: 8084
};

WebyMaze.ConfigCli.server	= WebyMaze.ConfigCli[WebyMaze.ConfigCli.PROJECT][WebyMaze.ConfigCli.ENV].server;
//WebyMaze.ConfigCli.server	= WebyMaze.ConfigCli['pacmaze']['dev'].server;

