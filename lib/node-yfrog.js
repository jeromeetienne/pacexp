
var Yfrog	= {};

Yfrog.upload	= function(opts)
{
	var imageFilename	= opts.imageFilename	|| console.assert(false);
	var twitterUsername	= opts.twitterUsername	|| console.assert(false);
	var twitterPassword	= opts.twitterPassword	|| console.assert(false);
	var developerKey	= opts.developerKey	|| console.assert(false);
	var successCb		= opts.success		|| console.assert(false);
	var errorCb		= opts.error		|| console.assert(false);
	
	var apiCallUrl	= "http://yfrog.com/api/upload";
	apiCallUrl	= "http://yfrog.com/api/uploadAndPost";

	// build the cmdline	
	var cmdline	 = 'curl';
	cmdline		+= ' -F "media=@'	+ imageFilename	+	';type=image/jpeg"';
	cmdline		+= ' -F username='	+ twitterUsername;
	cmdline		+= ' -F password='	+ twitterPassword;
	cmdline		+= ' -F key='		+ developerKey;
	cmdline		+= ' '+apiCallUrl;

	//console.log("cmdline", cmdline);
	
	var child	= require('child_process').exec(cmdline, function(error, stdout, stderr){
		//console.log('stdout: ' + stdout);
		console.dir(stdout.split("\n"));
		//console.log('stderr: ' + stderr);
		if (error !== null) {
			errorCb(error);
			return;
		}
		var lines	= stdout.split("\n");
		var statusStr	= lines[1].match(/"(.*)"/)[1];
//console.log("statusStr", statusStr)
		if( statusStr === 'fail' ){
			var errStr	= lines[2];
			errorCb({
				code	: errStr.match(/code="([^"]+)"/)[1],
				message	: errStr.match(/msg="([^"]+)"/)[1]
			});
		}else if( statusStr === 'ok' ){
			var imgUrl	= lines[lines.length-2].match(/>([^<]*)/)[1];
			successCb(imgUrl)
		}else	console.assert(false);
	});
}


module.exports	= Yfrog;

//
//Yfrog.upload({
//	imageFilename	: "/tmp/slota.jpg",
//	twitterUsername	: "urfastr",
//	twitterPassword	: "urfastrpassword",
//	developerKey	: "1CEFIKOP069911ecc9ed54de1a0263f0b56c9811",
//	error		: function(error){
//		console.log("an error occured. statusCode", error.code, "message", error.message)
//	},
//	success		: function(imgUrl){
//		console.log("completed ", imgUrl)
//	}
//});


