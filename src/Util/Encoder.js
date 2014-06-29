/**
* Supports Base64 and Base85 encodings.
**/
var Encoder = new Abstract({
	b64key: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
	
	encode64: function(input) {
		input = escape(input);
		var output = "";
		var chr1, chr2, chr3 = "";
		var enc1, enc2, enc3, enc4 = "";
		var i = 0;
		
		do {
			chr1 = input.charCodeAt(i++);
			chr2 = input.charCodeAt(i++);
			chr3 = input.charCodeAt(i++);
			
			enc1 = chr1 >> 2;
			enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
			enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
			enc4 = chr3 & 63;
			
			if (isNaN(chr2)) {
				enc3 = enc4 = 64;
			} else if (isNaN(chr3)) {
				enc4 = 64;
			}

			output = output +
			this.b64key.charAt(enc1) +
			this.b64key.charAt(enc2) +
			this.b64key.charAt(enc3) +
			this.b64key.charAt(enc4);
			chr1 = chr2 = chr3 = "";
			enc1 = enc2 = enc3 = enc4 = "";
		} while (i < input.length);
		
		return output;
	},

	decode64: function(input) {
		var output = "";
		var chr1, chr2, chr3 = "";
		var enc1, enc2, enc3, enc4 = "";
		var i = 0;
		
		// remove all characters that are not A-Z, a-z, 0-9, +, /, or =
		//var base64test = /[^A-Za-z0-9\+\/\=]/g;
		//if (base64test.exec(input)) {}
		input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
		
		do {
			enc1 = this.b64key.indexOf(input.charAt(i++));
			enc2 = this.b64key.indexOf(input.charAt(i++));
			enc3 = this.b64key.indexOf(input.charAt(i++));
			enc4 = this.b64key.indexOf(input.charAt(i++));
			
			chr1 = (enc1 << 2) | (enc2 >> 4);
			chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
			chr3 = ((enc3 & 3) << 6) | enc4;
			
			output = output + String.fromCharCode(chr1);
			
			if (enc3 != 64) {
				output = output + String.fromCharCode(chr2);
			}
			if (enc4 != 64) {
				output = output + String.fromCharCode(chr3);
			}
			
			chr1 = chr2 = chr3 = "";
			enc1 = enc2 = enc3 = enc4 = "";
		} while (i < input.length);
		
		return unescape(output);
	},
	
	c85: function(input, length, result) {
		var i, j, n, b = [0, 0, 0, 0, 0];
		for(i = 0; i < length; i += 4){
			n = ((input[i] * 256 + input[i+1]) * 256 + input[i+2]) * 256 + input[i+3];
			if(!n){
				result.push("z");
			}else{
				for(j = 0; j < 5; b[j++] = n % 85 + 33, n = Math.floor(n / 85));
			}
			result.push(String.fromCharCode(b[4], b[3], b[2], b[1], b[0]));
		}
	},
	
	// input byte array, output string
	encode85: function(input) {
		var result = [], remainder = input.length % 4, length = input.length - remainder;
		this.c85(input, length, result);
		if(reminder){
			var t = input.slice(length);
			while(t.length < 4){ t.push(0); }
			this.c85(t, 4, result);
			var x = result.pop();
			if(x == "z"){ x = "!!!!!"; }
			result.push(x.substr(0, remainder + 1));
		}
		return result.join("");
	},
	
	// input string, output byte array
	decode85: function(input) {
		var n = input.length, r = [], b = [0, 0, 0, 0, 0], i, j, t, x, y, d;
		for(i = 0; i < n; ++i){
			if(input.charAt(i) == "z"){
				r.push(0, 0, 0, 0);
				continue;
			}
			for(j = 0; j < 5; ++j){ b[j] = input.charCodeAt(i + j) - 33; }
			d = n - i;
			if(d < 5){
				for(j = d; j < 4; b[++j] = 0);
				b[d] = 85;
			}
			t = (((b[0] * 85 + b[1]) * 85 + b[2]) * 85 + b[3]) * 85 + b[4];
			x = t & 255;
			t >>>= 8;
			y = t & 255;
			t >>>= 8;
			r.push(t >>> 8, t & 255, y, x);
			for(j = d; j < 5; ++j, r.pop());
			i += 4;
		}
		return r;
	}

});

