var Type = function(name, obj) {
	if(name) {
		var lower = name.toLowerCase();
		var typeCheck = function(x) {
			return (typeOf(x) == lower);
		};
		
		Type['is'+name] = typeCheck;
		if(obj != null) {
			obj.prototype.$family = (function() {
				return lower;
			}).hide();
		}
	}
	
	if(obj == null) return null;
	
	obj.extend(this);
	obj.$constructor = Type;
	obj.prototype.$constructor = obj;
	
	return obj;
};

Type.isEnumerable = function(obj) {
	return (obj != null && typeof obj.length == 'number' && Object.prototype.toString.call(obj) != '[object Function]');
};

Type.implement({
	implement: $_implement.overloadSetter(),
	extend: $_extend.overloadSetter(),
	alias: function(name, orig) {
		$_implement.call(this, name, this.prototype[orig]);
	}.overloadSetter(),
	mirror: function(hook) {
		$_hooksOf(this).push(hook);
		return this;
	}
});

new Type('Type', Type);
new Type('Object');
new Type('WhiteSpace');
new Type('TextNode');
new Type('Collection');
new Type('Arguments');

Object.type = Type.isObject;

$_force('String', String, [
	'charAt', 'charCodeAt', 'concat', 'indexOf', 'lastIndexOf', 'match', 'quote', 'replace', 'search',
	'slice', 'split', 'substr', 'substring', 'toLowerCase', 'toUpperCase'
]);

$_force('Array', Array, [
	'pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift', 'concat', 'join', 'slice',
	'indexOf', 'lastIndexOf', 'filter', 'forEach', 'every', 'map', 'some', 'reduce', 'reduceRight'
]);

$_force('Number', Number, [
	'toExponential', 'toFixed', 'toLocaleString', 'toPrecision'
]);

$_force('Function', Function, [
	'apply', 'call', 'bind'
]);

$_force('RegExp', RegExp, [
	'exec', 'test'
]);

$_force('Object', Object, [
	'create', 'defineProperty', 'defineProperties', 'keys',
	'getPrototypeOf', 'getOwnPropertyDescriptor', 'getOwnPropertyNames',
	'preventExtensions', 'isExtensible', 'seal', 'isSealed', 'freeze', 'isFrozen'
]);

$_force('Date', Date, ['now']);
