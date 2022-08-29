
/* to provide compatibility with Type */
Number.prototype.$family = function() {
	return isFinite(this) ? 'number' : 'null';
}.hide();

Number.extend({
	random: function(min, max) {
		return Math.floor(Math.random() * (max - min + 1) + min);
	},
	
	from: function(obj) {
		var num = parseFloat(obj);
		return isFinite(num) ? num : null;
	}
});

Number.implement({
	toInt: function(base){
		return parseInt(this, base || 10);
	},
	
	toFloat: function(){
		return parseFloat(this);
	},
	
	limit: function(min, max){
		return Math.min(max, Math.max(min, this));
	},
	
	round: function(precision){
		precision = Math.pow(10, precision || 0).toFixed(precision < 0 ? -precision : 0);
		return Math.round(this * precision) / precision;
	},
	
	fractional: function() {
		return parseFloat(this) - parseInt(this);
	},
	
	times: function(fn, bind){
		for (var i = 0; i < this; i++) fn.call(bind, i, this);
	},
	
	zeroPad: function(width) {
		return (this.toString()).zeroPad(width);
	}
});

Number.alias('each', 'times');

/* add functions from Math to Number - for simpler code / less typing */
(function(math){
	var methods = {};
	math.each(function(name){
		if (!Number[name]) methods[name] = function(){
			return Math[name].apply(null, [this].concat(Array.from(arguments)));
		};
	});
	Number.implement(methods);
})(['abs', 'acos', 'asin', 'atan', 'atan2', 'ceil', 'cos', 'exp', 'floor', 'log', 'max', 'min', 'pow', 'sin', 'sqrt', 'tan'])
