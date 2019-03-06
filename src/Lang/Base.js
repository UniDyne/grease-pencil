/**
* Magic. This contains a lot of the utility code that makes the language
* extensions in GreasePencil.Lang possible. Much of what appears here was
* copied and tweaked from early versions of Prototype and MooTools.
**/

function typeOf(obj){
	if (obj == undefined) return false;
	var type = typeof obj;
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

function instanceOf(x, obj) {
	if(x == null) return false;
	var constructor = x.$constructor || x.constructor;
	while(constructor) {
		if(constructor == obj) return true;
		constructor = constructor.parent;
	}
	return x instanceof obj;
}

function cloneOf(obj) {
	switch(typeOf(obj)) {
		case 'array': return obj.clone();
		case 'object': return Object.clone(obj);
		default: return obj;
	}
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

var $_extend = function(name, method){
	if (method && method.$hidden) return this;
	var previous = this[name];
	if (previous == null || !previous.$protected) this[name] = method;
	return this;
};

var $_clone = function(obj) {
	switch(typeOf(obj)) {
		case 'array': return obj.clone();
		case 'object': return Object.clone(obj);
		default: return item;
	}
};

var $_mergeOne = function(source, key, current) {
	switch (typeOf(current)){
		case 'object':
			if (typeOf(source[key]) == 'object') Object.merge(source[key], current);
			else source[key] = Object.clone(current);
		break;
		case 'array': source[key] = current.clone(); break;
		default: source[key] = current;
	}
	return source;
};

var $_enumerables = [
	'hasOwnProperty',
	'valueOf',
	'isPrototypeOf',
	'propertyIsEnumerable',
	'toLocaleString',
	'toString',
	'constructor'
];

var $_force = function(name, obj, methods) {
	var isType = (obj != Object);
	var prototype = obj.prototype;
	if(isType) obj = new Type(name, obj);
	for(var i = 0, l = methods.length; i < l; i++) {
		var key = methods[i],
			generic = obj[key],
			proto = prototype[key];
		if(generic) generic.protect();
		if(isType && proto) {
			delete prototype[key];
			prototype[key] = proto.protect();
		}
	}
	if(isType) obj.implement(prototype);
	return $_force;
};

var $_parent = function(){
	if (!this.$caller) throw new Error('The method "parent" cannot be called.');
	var name = this.$caller.$name,
		parent = this.$caller.$owner.parent,
		previous = (parent) ? parent.prototype[name] : null;
	if (!previous) throw new Error('The method "' + name + '" has no parent.');
	return previous.apply(this, arguments);
};

var $_reset = function(object){
	for (var key in object){
		var value = object[key];
		switch (typeOf(value)){
			case 'object':
				var F = function(){};
				F.prototype = value;
				object[key] = reset(new F);
			break;
			case 'array': object[key] = value.clone(); break;
		}
	}
	return object;
};

var $_wrap = function(self, key, method){
	if (method.$origin) method = method.$origin;
	var wrapper = function(){
		if (method.$protected && this.$caller == null) throw new Error('The method "' + key + '" cannot be called.');
		var caller = this.caller, current = this.$caller;
		this.caller = current; this.$caller = wrapper;
		var result = method.apply(this, arguments);
		this.$caller = current; this.caller = caller;
		return result;
	}.extend({$owner: self, $origin: method, $name: key});
	return wrapper;
};

var $_implementC = function(key, value, retain){
	if (Class.Mutators.hasOwnProperty(key)){
		value = Class.Mutators[key].call(this, value);
		if (value == null) return this;
	}

	if (typeOf(value) == 'function'){
		if (value.$hidden) return this;
		this.prototype[key] = (retain) ? value : $_wrap(this, key, value);
	} else {
		Object.merge(this.prototype, key, value);
	}

	return this;
};

var $_getInstance = function(klass){
	klass.$prototyping = true;
	var proto = new klass;
	delete klass.$prototyping;
	return proto;
};

var $_removeOn = function(string){
	return string.replace(/^on([A-Z])/, function(full, first){
		return first.toLowerCase();
	});
};
