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
	var soundTrack		= null;

	//////////////////////////////////////////////////////////////////////////
	//		ctor/dtor						//
	//////////////////////////////////////////////////////////////////////////
	var ctor	= function(){		
		soundManager.onready(soundManagerReady);
	}
	var dtor	= function(){
		this.soundTrackDtor();
		
		for(var soundId in soundsIdToUrl){
			if( !sounds[soundId] )	continue;
			sounds[soundId].destruct();
		}
		sounds	= {};
	}
	

	/**
	 * Initialize the soundtrack
	 *
	 * - it is looping for ever
	*/
	var soundTrackCtor	= function(){
		//if( locationHash.get('nosound') )	return;
		console.log("los")
		soundTrack	= soundManager.createSound({
			id	: 'soundTrack',
			url	: 'sounds/Hot-Butter-Popcorn.mp3',
			autoLoad: true,
			volume	: 50,
			onload	: function() {
				soundTrack.play();
			},
			onfinish	: function(){
				soundTrack.play();
			}
		});
	}
	var soundTrackDtor	= function(){
		if( soundTrack ){
			soundTrack.destruct();
			soundTrack	= null;			
		}
	}
	var soundTrackRunning	= function(){
		return soundTrack ? true : false;
	}
	var soundTrackStart	= function(){
		soundTrackDtor();
		soundTrackCtor();
	}
	var soundTrackStop	= function(){
		soundTrackDtor();
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
		// create the sound track
		//soundTrackCtor();
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
		play			: play,
		soundTrackStart		: soundTrackStart,
		soundTrackStop		: soundTrackStop,
		soundTrackRunning	: soundTrackRunning
	};
}