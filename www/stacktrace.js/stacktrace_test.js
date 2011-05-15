/**
 * Generate and parse a computer friendly stacktrace
 * * works on node, chrome
 * * fails on firefox, but super easy to port
*/
function stacktraceGenerate(){
	// generate the current stack
	try{
		i.dont.exist	+= 0;
	}catch(e){
		var stackStr	= e.stack;
	}
	// split the stackStr
	var lines	= stackStr.split('\n');
	//console.log("lines", lines)
	// build the stack itself
	var stacktrace	= [];
	lines.forEach(function(line, index){
		//console.log("line", line)
		// remove all lines which arent location line
		if( line.match(/^ +at/) === null )	return;
		
		//console.log("line", line)
		if( line.match(/^ +at native$/) ){			
			stacktrace.push({
				'function'	: null,
				file		: "native",
				line		: null,
				column		: null			
			});
		}else if( line.match(/\)$/) ){
			// parse location line
			var matches	= line.match(/ +at (([^ ]+) )?\((.+):([^:]+):([^:]+)\)/);
			console.assert(matches && matches.length === 6, "This line isnt of the expected format: "+line)
			// put this location in the stacktrace array
			stacktrace.push({
				'function'	: matches[2],
				file		: matches[3],
				line		: matches[4],
				column		: matches[5]			
			});
		}else{
			var matches	= line.match(/ +at (.+):([^:]+):([^:]+)/);
			console.assert(matches && matches.length === 4, "This line isnt of the expected format: "+line)
			// put this location in the stacktrace array
			stacktrace.push({
				'function'	: null,
				file		: matches[1],
				line		: matches[2],
				column		: matches[3]			
			});
		}
	})
	// remove this function itself from the stacktrace
	stacktrace.shift();
	// return the just built stacktrace array
	return stacktrace;
}

/**
 * MUST follow console.* as close as possible
*/
var logjs	= logjs	|| {};
logjs._origConsole	= console;
logjs._logPrefix	= function(stackLevel){
	stackLevel	= stackLevel || 0;
	// get the current stacktrace
	var stacktrace	= stacktraceGenerate();
	// remove this function itself from the stacktrace
	stacktrace.shift();
// console.log("stacktrace"); console.dir(stacktrace);
	// build the log prefix
	var item	= stacktrace[stackLevel];
	var file	= item.file.match('/.*/([^/]+)$')[1]
	var prefix	= file+':'+item.line+":"+item.function+"():";
	// return the just-built prefix
	return prefix;
}
logjs.log	= function(){
	// build the log prefix
	var prefix	= logjs._logPrefix(1);
	// build the actual output from prefix and arguments
	var output	= prefix;
	for(var i = 0; i < arguments.length; i++){
		output	+= ' '+arguments[i];
	}
	// actually do the log
	logjs._origConsole.log(output)
}

logjs.wrapFunction	= function(fct){
	// console.log("wow"); console.dir(fct.__proto__);
	var args	= arguments;
	return function wow(){
		logjs.log("enter")
		fct.apply(this, args)
		logjs.log("leave")
	}.bind(this);
}

logjs.assert	= function(condition, reason){
	if( condition )	return;
	if( reason )	logjs.log("failed assert!", reason)
	else		logjs.log("failed assert!")
};

console	= logjs;

function slota2(){
	//console.dir(stacktraceGenerate());
	console.log("enter", 1+2, slota2);
	//console.log("bonjour")
	
	console.assert(false);
}
//slota2	= logjs.wrapFunction(slota2);
function slota3(){	slota2();	}
slota3();

//function slota4(){
//	console.log("prout")
//}
//slota4	= logjs.wrapFunction(slota4);
//console.log("slota4", slota4)
//slota4();
