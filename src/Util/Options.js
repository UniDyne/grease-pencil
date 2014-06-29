/**
* Adds options capability to classes.
* From MooTools.
**/

var Options = new Class({
	setOptions: function(){
		this.options = Object.merge.apply(null, [{},this.options].append(arguments));
		if (this.addEvent) for (var option in options){
			if (typeOf(options[option]) != 'function' || !(/^on[A-Z]/).test(option)) continue;
			this.addEvent(option, options[option]);
			delete options[option];
		}
		return this;
	}
});
