var WebyMaze	= WebyMaze || {};


WebyMaze.SoundRender	= function(opts){
	// set the default values if needed
	opts		= opts	|| {};
	opts.enableFx	= 'enableFx'	in opts ? opts.enableFx		: false;
	opts.enableTrack= 'enableTrack'	in opts ? opts.enableTrack	: false;

	//////////////////////////////////////////////////////////////////////////
	//		class variables						//
	//////////////////////////////////////////////////////////////////////////
	// private variables	
	var soundsFx	= {};
	var fxIdToUrl	= {
		'die'		: 'sounds/pacman/die.mp3',
		'win'		: 'sounds/pacman/vcs_90.mp3',
		'eatPill'	: 'sounds/pacman/eating.short.mp3',
		'eatEnergizer'	: 'sounds/pacman/eatpill.mp3',
		'eatGhost'	: 'sounds/pacman/eatghost.mp3',
		'siren'		: 'sounds/pacman/siren.mp3'
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
		for(var fxId in soundsIdToUrl){
			if( !soundsFx[fxId] )	continue;
			soundsFx[fxId].destruct();
		}
		soundsFx	= {};
	}
	

	/**
	 * Initialize the soundtrack
	 *
	 * - it is looping for ever
	*/
	var soundTrackCtor	= function(){
		// create the sound
		soundTrack	= soundManager.createSound({
			id	: 'soundTrack',
			url	: 'sounds/Hot-Butter-Popcorn.mp3',
			autoLoad: true,
			volume	: 100,
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
		if( opts.enableTrack )	soundTrackStart();
		// create all soundsFx
		for(var fxId in fxIdToUrl){
			var url	= fxIdToUrl[fxId];
			soundsFx[fxId]	= soundManager.createSound({
				id	: fxId,
				volume	: 50,
				url	: url,
				autoLoad: true
			});
		}
	}
	var soundFxPlay		= function(fxId){
		// return now if opts.enabledFx
		if( opts.enableFx === false )	return;
		console.log("soundRender.play() ", fxId);
		if( !soundsFx[fxId] )	console.log("sound "+fxId+" isnt init");
		if( !soundsFx[fxId] )	return;
		soundsFx[fxId].play();
	}	

	//////////////////////////////////////////////////////////////////////////
	//		getter/setter for the config				//
	//////////////////////////////////////////////////////////////////////////
	
	var enableFx	= function(val){
		if( typeof val === 'undefined' )	return opts.enableFx;
		return opts.enableFx = val;		
	}

	//////////////////////////////////////////////////////////////////////////
	//		run initialisation					//
	//////////////////////////////////////////////////////////////////////////
	// call the contructor
	ctor();
	// return public properties
	return {
		enableFx		: enableFx,
		soundFxPlay		: soundFxPlay,
		soundTrackStart		: soundTrackStart,
		soundTrackStop		: soundTrackStop,
		soundTrackRunning	: soundTrackRunning
	};
}

