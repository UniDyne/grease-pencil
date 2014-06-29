/**
* RegEx based data validation and lightweight string correction.
**/

var Validator = new Abstract({
	isZipCode: function(str) {
		var re = /^\d{5}([\-]\d{4})?$/;
		return (re.test(value));
	},
	
	isNumeric: function(str) {
		var re = /^[-+]?\d+(\.\d+)?$/;
		return re.test(inpString);
	},
	
	isDate: function(str, format) {
		var reg1, reg2;
		if (format == null) { format = "MDY"; }
		format = format.toUpperCase();
		if (format.length != 3) { format = "MDY"; }
		if ( (format.indexOf("M") == -1) || (format.indexOf("D") == -1) || (format.indexOf("Y") == -1) ) { format = "MDY"; }
		if (format.substring(0, 1) == "Y") {
			reg1 = /^\d{2}(\-|\/|\.)\d{1,2}\1\d{1,2}$/;
			reg2 = /^\d{4}(\-|\/|\.)\d{1,2}\1\d{1,2}$/;
		} else if (format.substring(1, 2) == "Y") {
			reg1 = /^\d{1,2}(\-|\/|\.)\d{2}\1\d{1,2}$/;
			reg2 = /^\d{1,2}(\-|\/|\.)\d{4}\1\d{1,2}$/;
		} else {
			reg1 = /^\d{1,2}(\-|\/|\.)\d{1,2}\1\d{2}$/;
			reg2 = /^\d{1,2}(\-|\/|\.)\d{1,2}\1\d{4}$/;
		}
		if ( (reg1.test(dateStr) == false) && (reg2.test(dateStr) == false) ) { return false; }
		var parts = dateStr.split(RegExp.$1);
		
		if (format.substring(0, 1) == "M") { var mm = parts[0]; }
		else if (format.substring(1, 2) == "M") { var mm = parts[1]; }
		else { var mm = parts[2]; }
		
		if (format.substring(0, 1) == "D") { var dd = parts[0]; }
		else if (format.substring(1, 2) == "D") { var dd = parts[1]; }
		else { var dd = parts[2]; }
		
		if (format.substring(0, 1) == "Y") { var yy = parts[0]; }
		else if (format.substring(1, 2) == "Y") { var yy = parts[1]; }
		else { var yy = parts[2]; }
		
		if (parseFloat(yy) <= 50) { yy = (parseFloat(yy) + 2000).toString(); }
		if (parseFloat(yy) <= 99) { yy = (parseFloat(yy) + 1900).toString(); }
		var dt = new Date(parseFloat(yy), parseFloat(mm)-1, parseFloat(dd), 0, 0, 0, 0);
		if (parseFloat(dd) != dt.getDate()) { return false; }
		if (parseFloat(mm)-1 != dt.getMonth()) { return false; }
		return true;
	},
	
	isTime: function(str) {
		var hasMeridian = false;
		var re = /^\d{1,2}[:]\d{2}([:]\d{2})?( [aApP][mM]?)?$/;
		if (!re.test(str)) { return false; }
		if (str.toLowerCase().indexOf("p") != -1) { hasMeridian = true; }
		if (str.toLowerCase().indexOf("a") != -1) { hasMeridian = true; }
		var values = str.split(":");
		if ( (parseFloat(values[0]) < 0) || (parseFloat(values[0]) > 23) ) { return false; }
		if (hasMeridian) {
			if ( (parseFloat(values[0]) < 1) || (parseFloat(values[0]) > 12) ) { return false; }
		}
		if ( (parseFloat(values[1]) < 0) || (parseFloat(values[1]) > 59) ) { return false; }
		if (values.length > 2) {
			if ( (parseFloat(values[2]) < 0) || (parseFloat(values[2]) > 59) ) { return false; }
		}
		return true;
	},
	
	isSSN: function(str) {
		var re = /^([0-6]\d{2}|7[0-6]\d|77[0-2])([ \-]?)(\d{2})\2(\d{4})$/;
		if (!re.test(str)) { return false; }
		var temp = str;
		if (value.indexOf("-") != -1) { temp = (str.split("-")).join(""); }
		if (value.indexOf(" ") != -1) { temp = (str.split(" ")).join(""); }
		if (temp.substring(0, 3) == "000") { return false; }
		if (temp.substring(3, 5) == "00") { return false; }
		if (temp.substring(5, 9) == "0000") { return false; }
		return true;
	},
	
	isEmail: function(str) {
		var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[(2([0-4]\d|5[0-5])|1?\d{1,2})(\.(2([0-4]\d|5[0-5])|1?\d{1,2})){3} \])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
		return re.test(str);
	},
	
	isPass: function(str) {
		var re = /^[A-Za-z]\w{6,}[A-Za-z]$/;
		return re.test(str);
	},
	
	isIP: function(str) {
		var re = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
		if (re.test(str)) {
			var parts = str.split(".");
			if (parseInt(parseFloat(parts[0])) == 0) { return false; }
			for (var i=0; i<parts.length; i++) {
				if (parseInt(parseFloat(parts[i])) > 255) return false;
			}
			
			return true;
		} else return false;
	},
	
	isCCN: function(str) {
		var re = /^(5[1-5][0-9]{14}|4[0-9]{12,15}|3(4|7)[0-9]{13}|6[0-2][0-9]{14})$/;
		if(re.test(str)) {
			var checksum = 0;
			for (var i=(2-(str.length % 2)); i<=str.length; i+=2)
				checksum += parseInt(str.charAt(i-1));
			for (var i=(str.length % 2) + 1; i<str.length; i+=2) {
				var digit = parseInt(str.charAt(i-1)) * 2;
				if (digit < 10) checksum += digit;
				else checksum += (digit-9);
			}
			if ((checksum % 10) != 0) return false;
			else return true;
		} else return false;
	},
	
	sqlSafe: function(str) {
		return str.replace(/'/g,"''");
	},
	
	trim: function(value) {
		var temp = value;
		var obj = /^(\s*)([\W\w]*)(\b\s*$)/;
		if (obj.test(temp)) { temp = temp.replace(obj, '$2'); }
		var obj = /  /g;
		while (temp.match(obj)) { temp = temp.replace(obj, " "); }
		return temp;
	},
	
	trimMore: function(value) {
		var temp = value;
		var obj = /^(\s*)([\W\w]*)(\b\s*$)/;
		if (obj.test(temp)) { temp = temp.replace(obj, '$2'); }
		var obj = / +/g;
		temp = temp.replace(obj, " ");
		if (temp == " ") { temp = ""; }
		return temp;
	}
});

