/**
 * Render camera
*/

var WebyMaze	= WebyMaze || {};

//////////////////////////////////////////////////////////////////////////////////
//		ctor/dtor							//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.LightingRender	= function(opts)
{
	// get variables from parameters
	this._mazeCli	= opts.mazeCli	|| console.assert(false);

	// init the instance variables
	this._state	= null;
	
	// init this_lightPool
	this._lightPool	= new WebyMaze.LightPool({
		scene		: scene,
		nAmbient	: 1,
		nDirectional	: 1,
		nPoint		: 3
	});
	this._lights	= [];
}

WebyMaze.LightingRender.prototype.destroy	= function()
{
	this._lightsDtor();
}

/**
 * Define all possible LightingStates
*/
WebyMaze.CameraRender.LightingStates	= ['day', 'emergency'];

//////////////////////////////////////////////////////////////////////////////////
//		public functions						//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.LightingRender.prototype.tick	= function()
{
	this._lights.forEach(function(light){
		light.tick();
	})
}

WebyMaze.LightingRender.prototype.changeState	= function(state)
{
	// if state is the current one, do nothing
	if( state === this._state )	return;

	// sanity check - state MUST be in LightingStates
	console.assert( WebyMaze.CameraRender.LightingStates.indexOf(state) !== -1 );
	
	// set the new state
	this._state	= state;
	// destroy the old lights
	this._lightsDtor();
	// build the new lights
	if( this._state === 'day' )		this._buildLightingDay();
	else if( this._state === 'emergency' )	this._buildLightingEmergency();
	else	console.assert(false);
}

//////////////////////////////////////////////////////////////////////////////////
//		misc								//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.LightingRender.prototype._lightInsert	= function(light)
{
	// add this light in this._lights
	this._lights.push( light );	
	// bind autodestroy
	light.bind('autodestroy', function(){
		light.destroy();
		this._lights.splice(this._lights.indexOf(light), 1);		
	}.bind(this))	
}

WebyMaze.LightingRender.prototype._lightsDtor	= function()
{
	while( this._lights.length ){
		var light	= this._lights.shift();
		light.destroy();		
	}
}
//////////////////////////////////////////////////////////////////////////////////
//										//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.LightingRender.prototype._buildLightingDay	= function()
{
	this._lightInsert(new WebyMaze.AmbientLight({
		lightPool	: this._lightPool,
		color		: 0xaaaaaa
	}));
	this._lightInsert(new WebyMaze.LightDirectional({
		lightPool	: this._lightPool,
		color		: 0xffffff,
		intensity	: 0.8,
		direction	: {
			x	: 0,
			y	: 0.3,
			z	: 0.7
		}
	}));
	this._lightInsert(new WebyMaze.LightPoint({
		lightPool	: this._lightPool,
		color		: 0xaa44aa,
		intensity	: 10,
		distance	: 1500,
		position	: {
			x	: 0,
			y	: 1000,
			z	: 0
		}
	}));
	this._lightInsert(new WebyMaze.LightPoint({
		lightPool	: this._lightPool,
		color		: 0x44FF44,
		intensity	: 10,
		distance	: 1500,
		position	: {
			x	: 11*100,
			y	: 1000,
			z	: 11*100
		}
	}));
}

WebyMaze.LightingRender.prototype._buildLightingEmergency	= function()
{
	this._lightInsert(new WebyMaze.AmbientLight({
		lightPool	: this._lightPool,
		color		: 0x222222
	}));
	this._lightInsert(new WebyMaze.LightDirectional({
		lightPool	: this._lightPool,
		color		: 0xffffff,
		intensity	: 0.8,
		direction	: {
			x	: 0,
			y	: 0.3,
			z	: 0.7
		}
	}));
	this._lightInsert(new WebyMaze.LightEmergency({
		lightPool	: this._lightPool,
		rangeX		: this._mazeCli.mapW()*100/2,
		rangeY		: this._mazeCli.mapH()*100/2,
		speedX		: 0.2,
		speedY		: 0.8,
		speedI		: 0.8
	}));
	this._lightInsert(new WebyMaze.LightEmergency({
		lightPool	: this._lightPool,
		rangeX		: this._mazeCli.mapW()*100/2,
		rangeY		: this._mazeCli.mapH()*100/2,
		speedX		: 0.6*2,
		speedY		: -0.3*2,
		speedI		: 0.8
	}));
	this._lightInsert(new WebyMaze.LightEmergency({
		lightPool	: this._lightPool,
		rangeX		: this._mazeCli.mapW()/2*100/2,
		rangeY		: this._mazeCli.mapH()/2*100/2,
		speedX		:  0.45*3,
		speedY		: -0.25*3,
		speedI		: 1.2
	}));
}


