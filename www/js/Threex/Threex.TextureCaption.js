// NOTE: this match THREE namespace on purpose
if(typeof THREEx === "undefined")		var THREEx	= {};
if(typeof THREEx.Texture === "undefined")	THREEx.Texture	= {};

/**
*/
THREEx.Texture.Caption	= {
	clear	: function(canvas){
		var w	= canvas.width;
		var ctx	= canvas.getContext( '2d' );
		clearRect(0, 0, w, w);	
	},
	/**
	 * display the shaddow of the smiley in a texture
	 *
	 * @param {canvasElement} the canvas where we draw
	*/
	textOnBack	: function(canvas, textData){
		var w		= canvas.width;
		var ctx		= canvas.getContext( '2d' );
		
		console.log("textData", textData)
		ctx.fillStyle	= "#FF0000";
		
		ctx.save();
		ctx.translate(w/2, w/2-w/32)
		ctx.lineCap = 'round';
		ctx.font	= "bold 40pt Arial";
		var textW	= ctx.measureText(textData).width;
		ctx.strokeStyle	= "rgb(0,0,0)";
		//console.log("measutreText", ctx.measureText(textData));
		ctx.fillText(textData, -textW/2, 0);
		ctx.restore();
	},

//////////////////////////////////////////////////////////////////////////////////
//		texture helper							//
//////////////////////////////////////////////////////////////////////////////////
	
	textTexture: function( textData, canvasW, mapping, callback ) {
		var canvasDrawer	= function(canvas){
			THREEx.Texture.Caption.textOnBack(canvas, textData);
		}
		return THREEx.Texture.Caption._buildTexture( canvasW, mapping, callback, canvasDrawer );
	},
	
	_buildTexture: function( canvasW, mapping, callback, canvasDrawer ) {
		canvasW		= typeof canvasW !== 'undefined' ? canvasW : 64;
		var canvas	= document.createElement('canvas');
		canvas.width	= canvas.height	= canvasW;
		var texture	= new THREE.Texture(canvas, mapping);

		canvasDrawer(canvas);

		texture.needsUpdate	= true;
		if( callback )	callback( this );
		return texture;
	},

}