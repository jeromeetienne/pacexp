var WebyMaze	= WebyMaze || {};

WebyMaze.SoundRender	= function(){
	//////////////////////////////////////////////////////////////////////////
	//		class variables						//
	//////////////////////////////////////////////////////////////////////////
	// private variables	
	var sounds		= {};
	var soundsIdToUrl	= {
		//'racketImpact'	: 'webymaze/vendor/soundmanager2/demo/_mp3/mouseover2.mp3',
		//'ballLoss'	: 'webymaze/vendor/soundmanager2/demo/_mp3/mak.mp3',
		'wallImpact'	: 'vendor/soundmanager2/demo/_mp3/click-high.mp3'
	}

	//////////////////////////////////////////////////////////////////////////
	//		ctor/dtor						//
	//////////////////////////////////////////////////////////////////////////
	var ctor	= function(){
		soundManager.url = 'vendor/soundmanager2/swf'; // directory where SM2 .SWFs live
		// do this to skip flash block handling for now. See the flashblock demo when you want to start getting fancy.
		soundManager.useFlashBlock	= false;
		soundManager.debugMode		= false;

		soundManager.onready(soundManagerReady);
	}
	var dtor	= function(){
		for(var soundId in soundsIdToUrl){
			if( !sounds[soundId] )	continue;
			sounds[soundId].destruct();
		}
		sounds	= {};
	}

	//////////////////////////////////////////////////////////////////////////
	//		Sound							//
	//////////////////////////////////////////////////////////////////////////	
	var soundManagerReady	= function(){
		// check if SM2 successfully loaded..
		if( !soundManager.supported() ){
			alert("soundmanager is not supported. no sound")
			return;
		}
		// create all sounds
		// - TODO likely an autoload is needed
		for(var soundId in soundsIdToUrl){
			var url	= soundsIdToUrl[soundId];
			sounds[soundId]	= soundManager.createSound({
				id	: soundId,
				url	: url,
				autoLoad: true
			});
		}
	}
	var play		= function(soundId){
		if( !sounds[soundId] )	console.log("sound "+soundId+" isnt init");
		if( !sounds[soundId] )	return;
		sounds[soundId].play();
	}	

	//////////////////////////////////////////////////////////////////////////
	//		run initialisation					//
	//////////////////////////////////////////////////////////////////////////
	// call the contructor
	ctor();
	// return public properties
	return {
		play	: play
	}
}