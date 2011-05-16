exports.insertInto	= function(app)
{
	app.options('/upload', function(req,res){
		res.header('Access-Control-Allow-Origin', '*');
		res.header('Access-Control-Allow-Methods', 'GET, HEAD, POST, PUT, DELETE, OPTIONS');
		res.header('Access-Control-Allow-Headers', 'Authorization, X-Prototype-Version, X-Requested-With, Content-type, Accept');
		res.header('Access-Control-Max-Age', '5');  // One day
		res.send('');
	});
		
	/**
	 * Used to upload image from the game
	*/
	app.post('/upload', function(req,res){
	console.log("RECVEING image to upload")
		var extPerMime	= {
			'image/png'	: '.png'
		}
		var dataUrl	= req.body.dataUrl;
		var matches	= dataUrl.match(/^data:(.*);base64,(.*)/);
		var mimetype	= matches[1];
		var dataBase64	= matches[2];
		var filename	= "/tmp/uploadedimg";
		if( mimetype in extPerMime )	filename += extPerMime[mimetype];
		require('fs').writeFileSync(filename, dataBase64, 'base64');
		
		
	
		res.header('Access-Control-Allow-Origin', '*');
		res.header('Access-Control-Allow-Methods', 'GET, HEAD, POST, PUT, DELETE, OPTIONS');
		res.header('Access-Control-Allow-Headers', 'Authorization, X-Prototype-Version, X-Requested-With, Content-type, Accept');
		res.header('Access-Control-Max-Age', '5');  // One day
		
		require('./node-yfrog').upload({
			imageFilename	: filename,
			twitterUsername	: "urfastr",
			twitterPassword	: "urfastrpassword",
			developerKey	: "1CEFIKOP069911ecc9ed54de1a0263f0b56c9811",
			error		: function(error){
				console.log("an error occured. statusCode", error.code, "message", error.message)			
			},
			success		: function(imgUrl){
				console.log("completed ", imgUrl)
				// reply this
				res.send(JSON.stringify({
					imgUrl	: imgUrl
				}));
				// TODO remove tmpfile
			}
		});
	});
}

