exports.insertInto	= function(app)
{
	/**
	 * Proxy service for same origin issue
	 * - used to download twitter avatar. thus their <img> can be dumped in the canvas
	 * - and still be origin-clean for .toDataUrl()
	*/
	app.get('/proxy', function(request,response){
		var http	= require('http');
		// extract path extname for the request url
		var query	= require('url').parse(request.url, true).query;
		var req_url	= query.url;
		// log the event
		console.log("proxy to "+req_url);
		// normal http proxying
		var parsedUrl		= require('url').parse(req_url);
		var host_field		= parsedUrl.host.split(':');
		// create the http request
		var proxy_request	= http.request({
			host	: host_field[0],
			port	: host_field[1] || 80,
			method	: request.method,
			path	: parsedUrl.pathname
		}, function(proxy_response){
			console.log("statusCode", proxy_response.statusCode);
			// put the header
			response.writeHead(proxy_response.statusCode, proxy_response.headers);
			// read data from proxy_response and queue them
			proxy_response.addListener('data', function(chunk) {
				response.write(chunk, 'binary');
			});
			// when proxy_reponse is over
			proxy_response.addListener('end', function() {
				response.end();
			});
		});
		request.addListener('data', function(chunk) {
			proxy_request.write(chunk, 'binary');
		});
		request.addListener('end', function() {
			proxy_request.end();
		});
	});
}