var LocationHash	= function(){
	/**
	 * Get the hash from window.location
	*/
	var _getUrlHash	= function(){
		var hash	= window.location.hash
		if( !hash )	return null;
		return hash.substr(1);
	};
	/**
	 * Set the hash to window.location
	*/
	var _setUrlHash	= function(val){
		window.location.hash	= '#'+val;
	}

	/**
	 * Convert a query evncoded string into a json object
	*/
	var parseQuery	= function(str){
		if(!str)	return {};
		var obj		= {};
		var keyvals	= str.split('&')
		for(var i = 0; i < keyvals.length; i ++){
			var keyval	= keyvals[i].split('=');
			obj[keyval[0]]	= keyval[1];
		}
		return obj;
	}
	/**
	 * Convert a json object to a query encoded string
	*/
	var buildQuery	= function(obj){
		var str	= "";
		for(var key in obj){
			if( str.length )	str += "&";
			str	+= key+"="+obj[key];
		}
		return str;
	}
	
	// parse the initial url
	var keys	= parseQuery(_getUrlHash());
	
	// return the public function
	return {
		get	: function(key){
			return keys[key];	
		},
		add	: function(key, val){
			keys[key]	= val;
			_setUrlHash(buildQuery(keys))
		},
		del	: function(key){
			delete keys[key];
			_setUrlHash(buildQuery(keys))
		}
	};
}
/**
 * Init the global instance
*/
var locationHash	= new LocationHash();