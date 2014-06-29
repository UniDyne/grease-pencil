/**
* Augmentations of the Array object. Portions borrowed from early versions of Prototype and MooTools.
**/


Array.extend({
	from: function(obj) {
		if(item == null) return [];
		return (Type.isEnumerable(obj) && typeof obj != 'string') ? (typeOf(item) == 'array') ? obj : Array.prototype.slice.call(obj) : [obj];
	}
});

Array.implement({
	forEach: function(fn, bind){
		for (var i = 0, l = this.length; i < l; i++){
			if (i in this) fn.call(bind, this[i], i, this);
		}
	},

	each: function(fn, bind){
		Array.forEach(this, fn, bind);
		return this;
	},
	
	clone: function() {
		var i = this.length, clone = new Array(i);
		while(i--) clone[i] = $_cloneOf(this[i]);
		return clone;
	},
	
	invoke: function(methodName){
		var args = Array.slice(arguments, 1);
		return this.map(function(item){
			return item[methodName].apply(item, args);
		});
	},
	
	clean: function(){
		return this.filter(function(item){
			return item != null;
		});
	},
	
	link: function(obj){
		var result = {};
		for (var i = 0, l = this.length; i < l; i++){
			for (var key in obj){
				if (obj[key](this[i])){
					result[key] = this[i];
					delete obj[key];
					break;
				}
			}
		}
		return result;
	},
	
	combine: function(array){
		for (var i = 0, l = array.length; i < l; i++) this.include(array[i]);
		return this;
	},
	
	erase: function(item){
		for (var i = this.length; i--;){
			if (this[i] === item) this.splice(i, 1);
		}
		return this;
	},
	
	empty: function(){
		this.length = 0;
		return this;
	},
	
	flatten: function(){
		var array = [];
		for (var i = 0, l = this.length; i < l; i++){
			var type = typeOf(this[i]);
			if (type == 'null') continue;
			array = array.concat((type == 'array' || type == 'collection' || type == 'arguments' || instanceOf(this[i], Array)) ? Array.flatten(this[i]) : this[i]);
		}
		return array;
	},
	
	include: function(item){
		if (!this.contains(item)) this.push(item);
		return this;
	},
	
	pick: function(){
		for (var i = 0, l = this.length; i < l; i++){
			if (this[i] != null) return this[i];
		}
		return null;
	},
	
	forEach: function(fn, bind){
		for (var i = 0, j = this.length; i < j; i++) fn.call(bind, this[i], i, this);
	},
	
	filter: function(fn, bind){
		var results = [];
		for (var i = 0, j = this.length; i < j; i++){
			if (fn.call(bind, this[i], i, this)) results.push(this[i]);
		}
		return results;
	},
	
	map: function(fn, bind){
		var results = [];
		for (var i = 0, j = this.length; i < j; i++) results[i] = fn.call(bind, this[i], i, this);
		return results;
	},
	
	every: function(fn, bind){
		for (var i = 0, j = this.length; i < j; i++){
			if (!fn.call(bind, this[i], i, this)) return false;
		}
		return true;
	},
	
	some: function(fn, bind){
		for (var i = 0, j = this.length; i < j; i++){
			if (fn.call(bind, this[i], i, this)) return true;
		}
		return false;
	},
	
	indexOf: function(item, from){
		var len = this.length;
		for (var i = (from < 0) ? Math.max(0, len + from) : from || 0; i < len; i++){
			if (this[i] === item) return i;
		}
		return -1;
	},
	
	copy: function(start, length){
		start = start || 0;
		if (start < 0) start = this.length + start;
		length = length || (this.length - start);
		var newArray = [];
		for (var i = 0; i < length; i++) newArray[i] = this[start++];
		return newArray;
	},
	
	remove: function(item){
		var i = 0;
		var len = this.length;
		while (i < len){
			if (this[i] === item){
				this.splice(i, 1);
				len--;
			} else {
				i++;
			}
		}
		return this;
	},
	
	contains: function(item, from){
		return this.indexOf(item, from) != -1;
	},
	
	associate: function(keys){
		var obj = {}, length = Math.min(this.length, keys.length);
		for (var i = 0; i < length; i++) obj[keys[i]] = this[i];
		return obj;
	},
	
	append: function(array){
		this.push.apply(this, array);
		return this;
	},
	
	merge: function(array){
		for (var i = 0, l = array.length; i < l; i++) this.include(array[i]);
		return this;
	},
	
	include: function(item){
		if (!this.contains(item)) this.push(item);
		return this;
	},
	
	getRandom: function(){
		return (this.length) ? this[Number.random(0, this.length - 1)] : null;
	},
	
	getLast: function(){
		return (this.length) ? this[this.length - 1] : null;
	},
	
	find: function(field, value) {
		var idx = -1;
		for(var i = 0; i < this.length; i++) {
			if(typeof this[i][field] == 'undefined') continue;
			if(this[i][field] == value) idx = i;
		}
		return idx;
	}

});

Array.alias('extend', 'append');

/**************


Array.prototype.each = Array.prototype.forEach;
Array.each = Array.forEach;

function $A(array){
	return Array.copy(array);
}

function $each(iterable, fn, bind){
	if (iterable && typeof iterable.length == 'number' && $type(iterable) != 'object'){
		Array.forEach(iterable, fn, bind);
	} else {
		 for (var name in iterable) fn.call(bind || iterable, iterable[name], name);
	}
}

function $modify(iterable, fn, bind) {
	if (iterable && typeof iterable.length == 'number' && $type(iterable) != 'object'){
		Array.modify(iterable, fn, bind);
	} else {
		for (var name in iterable) iterable[name] = fn.call(bind || iterable, iterable[name], name);
	}
}

function $modCopy(iterable, fn, bind) {
	if (iterable && typeof iterable.length == 'number' && $type(iterable) != 'object'){
		var newobj = $A(iterable);
		Array.modify(newobj, fn, bind);
		return newobj;
	} else {
		var newobj = {};
		for (var name in iterable)
			newobj[name] = fn.call(bind || iterable, iterable[name], name);
		return newobj;
	}
}

Array.prototype.test = Array.prototype.contains;

*******************/

