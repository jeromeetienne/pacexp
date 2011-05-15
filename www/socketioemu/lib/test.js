function slota1(){
	console.log("arg");
	console.dir(arguments)
	try{
		i.dont.exist+=0;
	}catch(e){
		//console.log("exception", e.stack)
		//console.dir(e)
		//console.dir(e.stack);
		console.log("end")
	}
}

function slota2(){	slota1();	}
function slota3(){	slota2();	}
slota3();


