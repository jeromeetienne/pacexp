
var brequiredFiles	= [];
brequiredFiles.push("brequired/angleSync.js");
brequiredFiles.push("brequired/angleUtils.js");
brequiredFiles.push("brequired/collisionUtils.js");
brequiredFiles.push("brequired/configProject.js");
brequiredFiles.push("brequired/configSrv.js");
brequiredFiles.push("brequired/enemySrv.js");
brequiredFiles.push("brequired/gameSrv.js");
brequiredFiles.push("brequired/levelConfig0.js");
brequiredFiles.push("brequired/levelConfig1.js");
brequiredFiles.push("brequired/levelConfig2.js");
brequiredFiles.push("brequired/mapUtils.js");
brequiredFiles.push("brequired/mapUtils2.js");
brequiredFiles.push("brequired/mapUtilsTests.js");
brequiredFiles.push("brequired/mapUtils2Tests.js");
brequiredFiles.push("brequired/mazeSrv.js");
brequiredFiles.push("brequired/microevent.js");
brequiredFiles.push("brequired/node-yfrog.js");
brequiredFiles.push("brequired/pillSrv.js");
brequiredFiles.push("brequired/playerSrv.js");
brequiredFiles.push("brequired/serverExpress.js");
brequiredFiles.push("brequired/serverMain.js");
brequiredFiles.push("brequired/serverProxy.js");
brequiredFiles.push("brequired/serverStatic.js");
brequiredFiles.push("brequired/serverUpload.js");
brequiredFiles.push("brequired/shootSrv.js");
brequiredFiles.push("brequired/tileMap.js");
brequiredFiles.push("brequired/tween.js");


// import all the server
// - during the build generation this file is passed thru uglify -d CPPFLAGS_MINIFIED
if( typeof CPPFLAGS_MINIFIED !== "undefined" ){
	importScripts('../../worker_build.min.js');	
}else{
	importScripts('../vendor/console4Worker/console4Worker-worker.js');
	importScripts('../vendor/microevent.js');
	importScripts('../lib/socketio-server.js');
	importScripts('../../vendor/brequire.js');
	brequiredFiles.forEach(function(src){
		//loadJavascript(src);
		importScripts('../../'+src);
	})	
}


require('./serverMain');

//importScripts('../../brequired/gameSrv.js');
//require('./server')
