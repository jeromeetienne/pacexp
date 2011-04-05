// NOTE: this match THREE namespace on purpose
if(typeof THREEx === "undefined")		var THREEx	= {};
if(typeof THREEx.Texture === "undefined")	THREEx.Texture	= {};

/**
 * - depends on a lib excanvas which isnt there
*/
THREEx.Texture.Smiley	= {
	/**
	 * display an happy smiley on a canvas for texture
	*/
	happy	: function(canvas){
		var w		= canvas.width;
		var ctx		= canvas.getContext( '2d' );
		
		var eyeDx	= w/16;
		var eyeDy	= w/12;
	
		var eyeW	= w/16;
		var eyeH	= w/6;
		
		var mouthW	= w/12;
		var mouthDy	= w/12;
		var mouthRbeg	= 0;
		var mouthRend	= 180 * Math.PI / 180;
			
		ctx.fillStyle = "rgb(0,0,0)";
		
		// right eyes
		ctx.save();
		ctx.translate(w/2 - w/2, w/2);
		ctx.fillEllipse(eyeDx - eyeW/2, - eyeDy - eyeH/2, eyeW, eyeH);
		ctx.restore();
	
		// left eyes
		ctx.save();
		ctx.translate(w/2 + w/2, w/2);
		ctx.fillEllipse(- eyeDx - eyeW/2, - eyeDy - eyeH/2, eyeW, eyeH);
		ctx.restore();
		
		// right part of the mouth
		ctx.save();
		ctx.beginPath();
		ctx.translate(w/2 - w/2, w/2);
		ctx.arc(0, mouthDy, mouthW, mouthRbeg, mouthRend, false)
		ctx.fill();
		ctx.restore();	
	
		// left part of the mouth
		ctx.save();
		ctx.beginPath();
		ctx.translate(w/2 + w/2, w/2);
		ctx.arc(0, mouthDy, mouthW, mouthRbeg, mouthRend, false)
		ctx.fill();
		ctx.restore();	
	},
	/**
	 * display an hurt smiley on a canvas for texture
	*/
	hurt	: function(canvas){
		var w		= canvas.width;
		var ctx		= canvas.getContext( '2d' );
	
		var eyeDx	= w/16;
		var eyeDy	= w/12;
	
		var eyeW	= w/24;
		var eyeH	= w/9;
	
		var mouthW	= w/12;
		var mouthDx	= 0;
		var mouthDy	= w/12;
	
		ctx.fillStyle	= "rgb(0,0,0)";
		ctx.lineCap	= "round";
		ctx.lineWidth	= w/48;

	
		// right eyes
		ctx.save();
		ctx.beginPath();
		ctx.translate(w/2 - w/2, w/2);
		ctx.translate(eyeDx, -eyeDy);
		ctx.moveTo(-eyeW/2, -eyeH/2);
		ctx.lineTo(+eyeW/2, +eyeH/2);
		ctx.stroke();		
		ctx.moveTo(+eyeW/2, -eyeH/2);
		ctx.lineTo(-eyeW/2, +eyeH/2);
		ctx.stroke();
		ctx.restore();
	
		// left eyes
		ctx.save();
		ctx.beginPath();
		ctx.translate(w/2 + w/2, w/2);
		ctx.translate(-eyeDx, -eyeDy);
		ctx.moveTo(-eyeW/2, -eyeH/2);
		ctx.lineTo(+eyeW/2, +eyeH/2);
		ctx.stroke();				
		ctx.moveTo(+eyeW/2, -eyeH/2);
		ctx.lineTo(-eyeW/2, +eyeH/2);
		ctx.stroke();
		ctx.restore();

	
		ctx.lineWidth	= w/32;

		// mouth flat (rigth)
		ctx.save();
		ctx.beginPath();
		ctx.translate(w/2 - w/2, w/2);
		ctx.translate(+mouthDx, +mouthDy);
		ctx.moveTo(-mouthW/2, 0);
		ctx.lineTo(+mouthW/2, 0);
		ctx.stroke();
		ctx.restore();
	
		// mouth flat (left)
		ctx.save();
		ctx.beginPath();
		ctx.translate(w/2 + w/2, w/2);
		ctx.translate(+mouthDx, +mouthDy);
		ctx.moveTo(-mouthW/2, 0);
		ctx.lineTo(+mouthW/2, 0);
		ctx.stroke();
		ctx.restore();		
	}	
}