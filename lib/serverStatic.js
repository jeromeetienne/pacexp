exports.insertInto	= function(app)
{
	var express	= require('express');	
	app.use(express.static(__dirname + '/../www'));	// FIXME this is here only because i cant take off cors
}

