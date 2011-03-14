var WebyMaze	= WebyMaze || {};

WebyMaze.PlayerSrv	= function(opts){
	this.ioClient	= opts.ioClient	|| console.assert(false);
	this.position	= opts.position	|| console.assert(false);
	this.rotation	= 'rotation' in opts ? opts.rotation : console.assert(false);
	this.speedFwd	= 10;
	this.speedAng	= 3 * Math.PI/180;

	this.userInput	= {};
	this.ioClient.on('message', function(msgStr){
		var message	= JSON.parse(msgStr)
		if( message.type === 'userInput' ){
			this.userInput[message.data.key]	= message.data.val;
			console.log("userinput", this.userInput);
		}
	}.bind(this));
	this.ioClient.on('disconnect', function(){
		console.log("not yet implemented");
	}.bind(this));
}

WebyMaze.PlayerSrv.prototype.destroy	= function(){
}


WebyMaze.PlayerSrv.prototype.tick	= function(){
	// TODO here do the move based on the user input
console.log("player tick")
	if( this.userInput.moveForward )	this.moveForward();
	if( this.userInput.moveBackward )	this.moveBackward();
	if( this.userInput.moveRight )		this.moveRight();
	if( this.userInput.moveLeft )		this.moveLeft();
}

WebyMaze.PlayerSrv.prototype.moveForward	= function(){
	this.position.x += Math.cos(this.rotation)*this.speedFwd;
	this.position.y += Math.sin(this.rotation)*this.speedFwd;
}
WebyMaze.PlayerSrv.prototype.moveBackward= function(){
	this.position.x -= Math.cos(this.rotation)*this.speedFwd;
	this.position.y -= Math.sin(this.rotation)*this.speedFwd;
}
WebyMaze.PlayerSrv.prototype.moveLeft	= function(){
	this.rotation += this.speedAng;
}
WebyMaze.PlayerSrv.prototype.moveRight	= function(){
	this.rotation -= this.speedAng;
}

WebyMaze.PlayerSrv.prototype.collideMaze	= function(maze){
	var map		= maze.getMap();
	var mazeH	= map.length;
	var mazeW	= map[0].length;
	var cubeW	= 100;

	//this._collideCube(-1*100,0*100,100)
	//this._collideCube(-3*100,1*100,100)
	//this._collideCube(-3*100,2*100,100)
	//this._collideCube(-3*100,3*100,100)
	//return;

	var collided	= false;
	for(var y = 0; y < mazeH; y++){
		var mazeLine	= map[y];
		for(var x = 0; x < mazeW; x++){
			var mazeXY	= mazeLine.charAt(x);
			if( mazeXY != '*' )	continue;
			var cubeX	= x * cubeW - mazeW*cubeW/2;
			var cubeY	= y * cubeW - mazeH*cubeW/2;
			if( this._collideCube(cubeX, cubeY, cubeW) ){
				collided	= true;
			}
		}
	}
	return collided;
}

/**
 * Test if there is a collision between the PlayerSrv and the cube. if there is, PlayerSrv is bounced
 *
 * @returns {Boolean} true if there is a collision, false otherwise
*/
WebyMaze.PlayerSrv.prototype._collideCube	= function(cubeX, cubeY, cubeW){
	var sphereW	= 100;
	var sphereMinX	= this.position.x;
	var sphereMinY	= this.position.y;
	var sphereMaxX	= this.position.x + sphereW;
	var sphereMaxY	= this.position.y + sphereW;
	var cubeMinX	= cubeX;
	var cubeMinY	= cubeY;
	var cubeMaxX	= cubeX+cubeW;
	var cubeMaxY	= cubeY+cubeW;

	// if there are no collision at all, return now
	if( sphereMinX >= cubeMaxX )	return false;
	if( sphereMinY >= cubeMaxY )	return false;
	if( sphereMaxY <= cubeMinY )	return false;
	if( sphereMaxX <= cubeMinX )	return false;


	var dx	= 0;
	var dy	= 0;

	// collision with left wall
	if( sphereMaxX > cubeMinX && sphereMaxX < cubeMaxX ){
		dx	= cubeMinX-sphereMaxX;
	}
	// collision with top wall
	if( sphereMaxY > cubeMinY && sphereMaxY < cubeMaxY ){
		dy	= cubeMinY-sphereMaxY;
	}
	// collision with right wall
	if( sphereMinX > cubeMinX && sphereMinX < cubeMaxX ){
		dx	= cubeMaxX-sphereMinX;
	}
	// collision with bottom wall
	if( sphereMinY > cubeMinY && sphereMinY < cubeMaxY ){
		dy	= cubeMaxY-sphereMinY;
	}
	
	// if collide in X and Y, bounce in the least force
	if( dx != 0 && dy != 0 ){
		if( Math.abs(dx) < Math.abs(dy) ){
			dy	= 0;
		}else{
			dx	= 0;
		}
	}
	// actually move this.mesg
	this.position.x	+= dx;
	this.position.y	+= dy;
	
	var collided	= dx != 0 || dy != 0;
	return collided;
}


// export commonjs module
if( module && module.exports ){
	module.exports	= WebyMaze.PlayerSrv;
}
