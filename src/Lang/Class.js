var Class = new Type('Class', function(params){
	if (instanceOf(params, Function)) params = {initialize: params};

	var newClass = function(){
		$_reset(this);
		if (newClass.$prototyping) return this;
		this.$caller = null;
		var value = (this.initialize) ? this.initialize.apply(this, arguments) : this;
		this.$caller = this.caller = null;
		return value;
	}.extend(this).implement(params);

	newClass.$constructor = Class;
	newClass.prototype.$constructor = newClass;
	newClass.prototype.parent = $_parent;

	return newClass;
})

Class.implement('implement', $_implementC.overloadSetter());

Class.Mutators = {
	Extends: function(parent){
		this.parent = parent;
		this.prototype = $_getInstance(parent);
	},

	Implements: function(items){
		Array.from(items).each(function(item){
			var instance = new item;
			for (var key in instance) $_implementC.call(this, key, instance[key], true);
		}, this);
	}
};

Class.empty = function(){};
