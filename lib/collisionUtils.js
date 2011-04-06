/**
 * what is the purpose of collision ?
 * - is there a collision or not
 * - location of the impacts
 * - position of the collided body after impact
*/

/** @namespace */
var WebyMaze	= WebyMaze || {};

/** bunch of functions
 * @constructs
*/
WebyMaze.Collision	= function(){}


/**
 * collision between a sphere and the maze
*/
WebyMaze.Collision.collideMaze	= function(spherePos, sphereW, maze){
	var collisions	= [];
	maze.forEachWall(function(x, y){
		var cubeX	= maze.map2spaceX(x);
		var cubeY	= maze.map2spaceY(y);
		var cubeW	= maze.tileW;
		var collision	= WebyMaze.Collision.collideCube(spherePos, sphereW, cubeX, cubeY, cubeW);
		if( collision )	collisions.push(collision);		
	})
	return collisions.length ? collisions : null;
}

/**
 * Test if there is a collision between the Collision and the cube. if there is, Collision is bounced

 * @returns {Boolean} true if there is a collision, false otherwise
*/
WebyMaze.Collision.collideCube	= function(spherePos, sphereW, cubeX, cubeY, cubeW){
	var collisions	= [];
	var sphereMinX	= spherePos.x - sphereW/2;
	var sphereMinY	= spherePos.y - sphereW/2;
	var sphereMaxX	= spherePos.x + sphereW/2;
	var sphereMaxY	= spherePos.y + sphereW/2;
	
	var cubeMinX	= cubeX - cubeW/2;
	var cubeMinY	= cubeY - cubeW/2;
	var cubeMaxX	= cubeX + cubeW/2;
	var cubeMaxY	= cubeY + cubeW/2;

	// if there are no collision at all, return now
	if( sphereMinX >= cubeMaxX )	return null;
	if( sphereMinY >= cubeMaxY )	return null;
	if( sphereMaxY <= cubeMinY )	return null;
	if( sphereMaxX <= cubeMinX )	return null;


	var dx	= 0;
	var dy	= 0;

	// collision with west wall
	if( sphereMaxX > cubeMinX && sphereMinX < cubeX ){
		dx	= cubeMinX-sphereMaxX;
		collisions.push({
			x	: cubeMinX,
			y	: spherePos.y
		})
	}
	// collision with north wall
	if( sphereMaxY > cubeMinY && sphereMinY < cubeY ){
		dy	= cubeMinY-sphereMaxY;
		collisions.push({
			x	: spherePos.x,
			y	: cubeMinY
		})
	}
	// collision with east wall
	if( sphereMaxX > cubeX && sphereMinX < cubeMaxX ){
		dx	= cubeMaxX-sphereMinX;
		collisions.push({
			x	: cubeMaxX,
			y	: spherePos.y
		})
	}
	// collision with south wall
	if( sphereMaxY > cubeY && sphereMinY < cubeMaxY ){
		dy	= cubeMaxY-sphereMinY;
		collisions.push({
			x	: spherePos.x,
			y	: cubeMaxX
		})
	}
	
	//console.log("dx", dx, "dy", dy)
	// if collide in X and Y, bounce in the least force
	if( dx != 0 && dy != 0 ){
		if( Math.abs(dx) < Math.abs(dy) ){
			dy	= 0;
		}else{
			dx	= 0;
		}
	}
	
	//console.log("dx", dx, "dy", dy)
	//// actually move spherePos
	spherePos.x	+= dx;
	spherePos.y	+= dy;
	
	return collisions.length ? collisions : null;
}


WebyMaze.Collision.collideSphere	= function(sphere1Pos, sphere1W, sphere2Pos, sphere2W){
	var radius1	= sphere1W/2;
	var radius2	= sphere2W/2;

	// handle sphere2Pos == sphere1Pos special case
	if( sphere2Pos.x == sphere1Pos.x && sphere2Pos.y == sphere1Pos.y ){
		// do a random bump to solve it
		var bumpAng	= Math.random()*Math.PI*2;
		sphere1Pos.x	+= Math.cos(bumpAng);
		sphere1Pos.y	+= Math.sin(bumpAng);
		sphere2Pos.x	-= Math.cos(bumpAng);
		sphere2Pos.y	-= Math.sin(bumpAng);
	}

	// compute the distance between the 2
	var deltaX	= sphere2Pos.x - sphere1Pos.x;
	var deltaY	= sphere2Pos.y - sphere1Pos.y;
	var dist	= Math.sqrt(deltaX*deltaX + deltaY*deltaY);
	if(dist >= radius1 + radius2)	return null;

	// compute unit vector
	var unitX	= deltaX/dist;
	var unitY	= deltaY/dist;
	// just a little increase to prevent floatingpoint error
	//unitX	*= 1.01;
	//unitY	*= 1.01;
	// compute contact point after the bounce
	var midX	= sphere1Pos.x + deltaX*(radius1/(radius1+radius2));
	var midY	= sphere1Pos.y + deltaY*(radius1/(radius1+radius2));
	// recompute this body position
	sphere1Pos.x	= midX - unitX * radius1;
	sphere1Pos.y	= midY - unitY * radius1;
	// recompute otherBody position
	sphere2Pos.x	= midX + unitX * radius2;
	sphere2Pos.y	= midY + unitY * radius2;

	// return true for collided
	return [{ x: midX, y: midY }];
}


//////////////////////////////////////////////////////////////////////////////////
//		commonjs exports						//
//////////////////////////////////////////////////////////////////////////////////

// export in common js
if( typeof module !== "undefined" && ('exports' in module)){
	module.exports	= WebyMaze.Collision;
}
