var log	= function(){
	var data	= Array.prototype.slice.call(arguments).map(function(arg){
		if( typeof arg === "number" )	return arg;
		if( typeof arg === "boolean" )	return arg;
		if( typeof arg === "object" ){
			try {
				return JSON.parse(JSON.stringify(arg));
			}catch(e){}
		}		
		return String(arg);
	});
	//var data	= Array.prototype.slice.call(arguments);
	console.log("data", data.length)
	console.log.apply(console, data)
}



log("slota", "sloti");
//log("slota", log, {
//	foo	: 'bar'
//}, console);
