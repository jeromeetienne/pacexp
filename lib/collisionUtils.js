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

	var collisions	= [];
	for(var y = 0; y < mazeH; y++){
		var mazeLine	= map[y];
		for(var x = 0; x < mazeW; x++){
			var mazeXY	= mazeLine.charAt(x);
			if( mazeXY != '*' )	continue;
			var cubeX	= x*cubeW + cubeW/2 - mazeW*cubeW/2;
			var cubeY	= y*cubeW + cubeW/2 - mazeH*cubeW/2;
			var collision	= WebyMaze.Collision.collideCube(spherePos, sphereW, cubeX, cubeY, cubeW);
			if( collision )	collisions.push(collision);
		}
	}
	return collisions.length ? collisions : null;
}

/**
 * Test if there is a collision between the Collision and the cube. if there is, Collision is bounced
 *
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

	// collision with left wall
	if( sphereMaxX > cubeMinX && sphereMaxX < cubeMaxX ){
		dx	= cubeMinX-sphereMaxX;
		collisions.push({
			x	: cubeMinX,
			y	: spherePos.y
		})
	}
	// collision with north wall
	if( sphereMaxY > cubeMinY && sphereMaxY < cubeMaxY ){
		dy	= cubeMinY-sphereMaxY;
		collisions.push({
			x	: spherePos.x,
			y	: cubeMinX
		})
	}
	// collision with right wall
	if( sphereMinX > cubeMinX && sphereMinX < cubeMaxX ){
		dx	= cubeMaxX-sphereMinX;
		collisions.push({
			x	: cubeMaxX,
			y	: spherePos.y
		})
	}
	// collision with south wall
	if( sphereMinY > cubeMinY && sphereMinY < cubeMaxY ){
		dy	= cubeMaxY-sphereMinY;
		collisions.push({
			x	: spherePos.x,
			y	: cubeMaxX
		})
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
	
	return collisions.length ? collisions : null;
}


WebyMaze.Collision.collideSphere	= function(sphere1Pos, sphere1W, sphere2Pos, sphere2W){
	var radius1	= sphere1W/2;
	var radius2	= sphere2W/2;

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

// export in common js
if( typeof module !== "undefined" && ('exports' in module)){
	module.exports	= MicroEvent
}
