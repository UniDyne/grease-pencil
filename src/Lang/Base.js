/**
* Utility methods used throughout framework.
**/

// a better typeOf w/ more granular types
function typeOf(obj){
	if (obj == undefined) return false;
	var type = typeof obj;

	// Save for HTA and XML use.
	if (type == 'object' && obj.nodeName){
		switch(obj.nodeType){
			case 1: return 'element';
			case 3: return (/\S/).test(obj.nodeValue) ? 'textnode' : 'whitespace';
		}
	}
	if (type == 'object' || type == 'function'){
		switch(obj.constructor){
			case Array: return 'array';
			case RegExp: return 'regexp';
			case Class: return 'class';
			case Date: return 'date';
		}
		if (typeof obj.length == 'number'){
			if (obj.item) return 'collection';
			if (obj.callee) return 'arguments';
		}
	}
	return type;
}

// confirms constructor matches
function instanceOf(x, obj) {
	if(x == null) return false;
	var constructor = x.$constructor || x.constructor;
	while(constructor) {
		if(constructor == obj) return true;
		constructor = constructor.parent;
	}
	return x instanceof obj;
}

var $_hooks = {};
var $_hooksOf = function(object){
	var type = typeOf(object.prototype);
	return $_hooks[type] || ($_hooks[type] = []);
};

var $_implement = function(name, method){
	if (method && method.$hidden) return this;

	var hooks = $_hooksOf(this);

	for (var i = 0; i < hooks.length; i++){
		var hook = hooks[i];
		if (typeOf(hook) == 'type') $_implement.call(hook, name, method);
		else hook.call(this, name, method);
	}
	
	var previous = this.prototype[name];
	if (previous == null || !previous.$protected) this.prototype[name] = method;

	if (this[name] == null && typeOf(method) == 'function') $_extend.call(this, name, function(item){
		return method.apply(item, Array.prototype.slice.call(arguments, 1));
	});

	return this;
};

/* used for method overloading */
var $_extend = function(name, method){
	if (method && method.$hidden) return this;
	var previous = this[name];
	if (previous == null || !previous.$protected) this[name] = method;
	return this;
};
