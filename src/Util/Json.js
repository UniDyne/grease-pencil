/**
* JSON encoder/decoder.
**/
var $specialChars = {'\b': '\\b', '\t': '\\t', '\n': '\\n', '\f': '\\f', '\r': '\\r', '"' : '\\"', '\\': '\\\\'};
 function $replaceChars(chr){
	return $specialChars[chr] || '\\u00' + Math.floor(chr.charCodeAt() / 16).toString(16) + (chr.charCodeAt() % 16).toString(16);
}

var JSON = new Abstract({
	stringify: function(obj){
		switch (typeOf(obj)){
			case 'string':
				return '"' + obj.replace(/[\x00-\x1f\\"]/g, $replaceChars) + '"';
			case 'array':
				return '[' + String(obj.map(JSON.stringify).clean()) + ']';
			case 'object': case 'hash':
				var string = [];
				Object.each(obj, function(value, key){
					var json = JSON.stringify(value);
					if (json) string.push(JSON.stringify(key) + ':' + json);
				});
				return '{' + string + '}';
			case 'number': case 'boolean': return String(obj);
			case 'null': return 'null';
		}
		return null;
	},

	parse: function(string, secure){
		if (typeOf(string) != 'string' || !string.length) return null;
		if (secure && !(/^[,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t]*$/).test(string.replace(/\\./g, '@').replace(/"[^"\\\n\r]*"/g, ''))) return null;
		return eval('(' + string + ')');
	}
});
