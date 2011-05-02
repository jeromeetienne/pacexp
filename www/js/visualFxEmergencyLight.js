/** @namespace */
var WebyMaze	= WebyMaze || {};

//////////////////////////////////////////////////////////////////////////////////
//		ctor/dtor							//
//////////////////////////////////////////////////////////////////////////////////

/**
 * contructor
 * 
 * TODO make an animation
 * - 2 tweens... one on the scale to make the sphere grow
 * - one to change the opacity
 * - maybe several spheres to give an impression of smoke
*/
WebyMaze.VisualFxEmergencyLight	= function(opts)
{
	this._rangeX	= opts.rangeX		|| console.assert(false);
	this._rangeY	= opts.rangeY		|| console.assert(false);
	this._speedX	= opts.speedX		|| console.assert(false);
	this._speedY	= opts.speedY		|| console.assert(false);
	this._speedI	= opts.speedI		|| console.assert(false);
	this._timeToLive= opts.timeToLive	|| 1*1000;


	// add a pointLight to experiment with it
	this._light	= new THREE.PointLight( 0xFFFFFF, 10, 500);
	this._light.position.x = 0;
	this._light.position.y = 50;
	this._light.position.z = 0;
	
/**
 * make a pool of pointLight at the begining
 * - object3d pool ?
*/

	this._container	= this._light;
}

/**
*/
WebyMaze.VisualFxEmergencyLight.prototype.destroy	= function()
{
}


// mixin MicroEvent 
MicroEvent.mixin(WebyMaze.VisualFxEmergencyLight);

//////////////////////////////////////////////////////////////////////////////////
//		misc								//
//////////////////////////////////////////////////////////////////////////////////

WebyMaze.VisualFxEmergencyLight.prototype.tick	= function()
{
	// honor this._timeToLive if needed
	if( this._timeToLive ){
		var present	= new Date();
		var age		= present - this._createdAt;
		if( age > this._timeToLive )	this.trigger('autodestroy');		
	}
	
	var t	= Date.now() / 1000 * Math.PI;
	var dt	= Math.PI/2;
	dt	= 0;
	this._light.position.x	= Math.sin(this._speedX*t) * this._rangeX;
	this._light.position.z	= Math.sin(this._speedY*t+dt) * this._rangeY;
	
	//console.log("color", this._light.color);
	
	

	//var r	= Math.sin(8*t);
	//this._light.color.setRGB(c*0.4+0.6, 0.0, 0.0)
	//this._light.color.setRGB(c*0.5+0.5, 0.0, 0.0)

	var i	= Math.sin(this._speedI*t);
//console.log("i", i)
	if( i > 0 ){
		i	= Math.abs(i)*100;
		this._light.color.setRGB(1, 0.05, 0.05)
	}else{
		i	= Math.abs(i)*100;
		this._light.color.setRGB(0.05, 0.05, 1.0)
	}
	this._light.intensity	= i;
 }

/**
 * Return the object3d containing this one
*/
WebyMaze.VisualFxEmergencyLight.prototype.obj3d	= function(){
	return this._container;
}
