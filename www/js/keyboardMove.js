var WebyMaze	= WebyMaze || {};

/**
 * Bind keyboard to move
*/
WebyMaze.KeyboardMove	= function(){
	var move	 = {};
	var onKeyDown = function ( event ) {
		switch( event.keyCode ) {
			case 38: /*up*/
			case 87: /*W*/ move.moveForward = true; break;
			case 37: /*left*/
			case 65: /*A*/ move.moveLeft = true; break;
			case 40: /*down*/
			case 83: /*S*/ move.moveBackward = true; break;
			case 39: /*right*/
			case 68: /*D*/ move.moveRight = true; break;
		}
	};
	var onKeyUp = function ( event ) {
		switch( event.keyCode ) {
			case 38: /*up*/
			case 87: /*W*/ move.moveForward = false; break;
			case 37: /*left*/
			case 65: /*A*/ move.moveLeft = false; break;
			case 40: /*down*/
			case 83: /*S*/ move.moveBackward = false; break;
			case 39: /*right*/
			case 68: /*D*/ move.moveRight = false; break;
		}
	};
	document.addEventListener( 'keydown', onKeyDown, false );
	document.addEventListener( 'keyup', onKeyUp, false );
	return move;
}
