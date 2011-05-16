exports.create	= function()
{
	var express	= require('express');
	var app		= express.createServer();

	//app.use(express.logger());
	app.use(express.bodyParser());
	
	
	return app;
}