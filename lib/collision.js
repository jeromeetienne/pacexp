var WebyMaze	= WebyMaze || {};

WebyMaze.Collision	= function(){}

/**
 * TODO put the cubeW/sphereW = 100 as function parameter
*/

WebyMaze.Collision.collideMaze	= function(spherePos, sphereW, maze){
	var map		= maze.getMap();
	var cubeW	= maze.cubeW;
	var mazeH	= map.length;
	var mazeW	= map[0].length;

	var collided	= false;
	for(var y = 0; y < mazeH; y++){
		var mazeLine	= map[y];
		for(var x = 0; x < mazeW; x++){
			var mazeXY	= mazeLine.charAt(x);
			if( mazeXY != '*' )	continue;
			var cubeX	= x * cubeW - mazeW*cubeW/2;
			var cubeY	= y * cubeW - mazeH*cubeW/2;
			if( WebyMaze.Collision.collideCube(spherePos, sphereW, cubeX, cubeY, cubeW) ){
				collided	= true;
			}
		}
	}
	return collided;
}

/**
 * Test if there is a collision between the Collision and the cube. if there is, Collision is bounced
 *
 * @returns {Boolean} true if there is a collision, false otherwise
*/
WebyMaze.Collision.collideCube	= function(spherePos, sphereW, cubeX, cubeY, cubeW){
	var sphereMinX	= spherePos.x;
	var sphereMinY	= spherePos.y;
	var sphereMaxX	= spherePos.x + sphereW;
	var sphereMaxY	= spherePos.y + sphereW;
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
	// actually move spherePos
	spherePos.x	+= dx;
	spherePos.y	+= dy;
	
	var collided	= dx != 0 || dy != 0;
	return collided;
}


WebyMaze.Collision.collideSphere	= function(sphere1Pos, sphere1W, sphere2Pos, sphere2W){
	var radius1	= sphere1W/2;
	var radius2	= sphere2W/2;
	
	var deltaX	= sphere2Pos.x - sphere1Pos.x;
	var deltaY	= sphere2Pos.y - sphere1Pos.y;
	var dist	= Math.sqrt(deltaX*deltaX + deltaY*deltaY);
	if(dist >= radius1 + radius2)	return false;
	
	// compute unit vector
	var unitX	= deltaX/dist;
	var unitY	= deltaY/dist;
	// just a little increase to prevent floatingpoint error
	unitX	*= 1.01;
	unitY	*= 1.01;
	// compute contact point after the bounce
	var midX	= sphere1Pos.x + deltaX/2
	var midY	= sphere1Pos.y + deltaY/2
	// recompute this body position
	sphere1Pos.x	= midX - unitX * radius1;
	sphere1Pos.y	= midY - unitY * radius1;
	// recompute otherBody position
	sphere2Pos.x	= midX + unitX * radius2;
	sphere2Pos.y	= midY + unitY * radius2;
}

// export commonjs module
if( module && module.exports ){
	module.exports	= WebyMaze.Collision;
}
