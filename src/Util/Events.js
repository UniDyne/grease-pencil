/**
* Simple event manager.
**/

var $_removeOn = function(string){
	return string.replace(/^on([A-Z])/, function(full, first){
		return first.toLowerCase();
	});
};

var Events = new Class({
	$events: {},
	
	addEvent: function(type, fn){
		type = $_removeOn(type);
		if(fn == Class.empty) return this;
		
		this.$events[type] = (this.$events[type] || []).include(fn);
		return this;
	},
	
	addEvents: function(events){
		for (var type in events) this.addEvent(type, events[type]);
		return this;
	},
	
	fireEvent: function(type, args){
		type = removeOn(type);
		var events = this.$events[type];
		if (!events) return this;
		args = Array.from(args);
		events.each(function(fn){
			fn.apply(this, args);
		}, this);
		return this;
	},
	
	removeEvent: function(type, fn){
		type = $_removeOn(type);
		var events = this.$events[type];
		if (events && !fn.internal){
			var index =  events.indexOf(fn);
			if (index != -1) delete events[index];
		}
		return this;
	},

	removeEvents: function(events){
		var type;
		if (typeOf(events) == 'object'){
			for (type in events) this.removeEvent(type, events[type]);
			return this;
		}
		if (events) events = $_removeOn(events);
		for (type in this.$events){
			if (events && events != type) continue;
			var fns = this.$events[type];
			for (var i = fns.length; i--;) if (i in fns){
				this.removeEvent(type, fns[i]);
			}
		}
		return this;
	}

});
