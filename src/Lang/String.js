String.extend({
	from: function(obj) {
		return obj + '';
	},
	
	// deprecated. Use GUID generator.
	uniqueID: function() {
		return Date.now().toString(36);
	}
});
	
String.implement({
	left: function(len) {
		return this.substring(0, len);
	},

	right: function(len) {
		return this.substring(this.length - len, this.length);
	},

	test: function(regex, params){
		return (($type(regex) == 'string') ? new RegExp(regex, params) : regex).test(this);
	},
	
	repeat: function(times) {
		var s = '';
		for(var i = 0; i < times; i++) s += this;
		return s;
	},
	
	spacePad: function(width) {
		return this + ' '.repeat(width - this.length);
	},
	
	zeroPad: function(width) {
		return '0'.repeat(width - this.length) + this;
	},
	
	reverse: function() {
		return (this.split('')).reverse().join('');
	},
	
	toInt: function(){
		return parseInt(this, 10);
	},
	
	toFloat: function(){
		return parseFloat(this);
	},
	
	camelCase: function(){
		return this.replace(/-\D/g, function(match){
			return match.charAt(1).toUpperCase();
		});
	},
	
	hyphenate: function(){
		return this.replace(/\w[A-Z]/g, function(match){
			return (match.charAt(0) + '-' + match.charAt(1).toLowerCase());
		});
	},
	
	capitalize: function(){
		return this.replace(/\b[a-z]/g, function(match){
			return match.toUpperCase();
		});
	},
	
	trim: function(){
		return this.replace(/^\s+|\s+$/g, '');
	},
	
	clean: function(){
		return this.replace(/\s{2,}/g, ' ').trim();
	},
	
	contains: function(string, s){
		return (s) ? (s + this + s).indexOf(s + string + s) > -1 : this.indexOf(string) > -1;
	},
	
	substitute: function(object, regexp){
		return this.replace(regexp || (/\\?\{([^{}]+)\}/g), function(match, name){
			if (match.charAt(0) == '\\') return match.slice(1);
			return (object[name] != null) ? object[name] : '';
		});
	},
	
	escapeRegExp: function(){
		return this.replace(/([.*+?^${}()|[\]\/\\])/g, '\\$1');
	}

});
