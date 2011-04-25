/**
 * http proxy
 * 
 * - initial proxy code from Peteris Krumins (peter@catonmat.net)
 *   - http://www.catonmat.net  --  good coders code, great reuse
*/

// include system dependancies
var http	= require('http');
var url_module	= require('url');


/**
 * Callback for http_server
 * - it handles the proxying itself
*/
function http_server_cb(request, response){
	// extract path extname for the request url
	var query	= require('url').parse(request.url, true).query;
	var req_url	= query.url;
	// log the event
	console.log("proxy to "+req_url);
	// normal http proxying
	var host_field		= require('url').parse(req_url).host.split(':');
	var proxy		= http.createClient(host_field[1] || 80, host_field[0])
	var proxy_request	= proxy.request(request.method, req_url, request.headers);
	proxy_request.addListener('response', function(proxy_response) {
		// read data from proxy_response and queue them
		var body	= "";
		proxy_response.addListener('data', function(chunk) {
			console.log('data', chunk)
			body	+= chunk.toString();
		});
		// when proxy_reponse is over
		proxy_response.addListener('end', function() {
			// handle the jsonp escaping
			if( query.callback ){
				body	= query.callback + "(" + JSON.stringify(body) + ")";
			}
			// update the content-length
			proxy_response.headers['content-length']	= body.length;
			// put the header
			response.writeHead(proxy_response.statusCode, proxy_response.headers);
			response.end(body);
		});
	});
	request.addListener('data', function(chunk) {
		proxy_request.write(chunk, 'binary');
	});
	request.addListener('end', function() {
		proxy_request.end();
	});
}


//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
//	Main code								//
//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////

cmdline_opts	= {
	port	: 8082
};

//////////////////////////////////////////////////////////////////////////////////
//	parse cmdline								//
//////////////////////////////////////////////////////////////////////////////////
var disp_usage	= function(prefix){
	if(prefix)	console.log(prefix + "\n");
	console.log("usage: http_proxy.js [-s port] [-x port]");
	console.log("");
	console.log("Run a http proxy with jsonp enable");
	console.log("");
	console.log("-p|--port PORT\n\t\tSet the port to listen on. Default to "+cmdline_opts.port);
	console.log("-h|--help\tDisplay the inline help.");
}
var optind	= 2;
for(;optind < process.argv.length; optind++){
	var key	= process.argv[optind];
	var val	= process.argv[optind+1];
	//console.log("key="+key+" val="+val);
	if( key == "-p" || key == "--port" ){
		cmdline_opts.port	= val;
		optind		+= 1;
	}else if( key == "-h" || key == "--help" ){
		disp_usage();
		process.exit(0);
	}else{
		// if the option doesnt exist, consider it is the first non-option parameters
		break;
	}
}

// launch the server itself
http.createServer(http_server_cb).listen(cmdline_opts.port);
