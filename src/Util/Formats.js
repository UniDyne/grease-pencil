/**
* String formatting functions.
**/

var Formats = new Abstract({
	currency: function(num) {
		num = num.toString().replace(/\$|\,/g,'');
		if(isNaN(num)) num = "0";
		sign = (num == (num = Math.abs(num)));
		num = Math.floor(num*100+0.50000000001);
		cents = num%100;
		num = Math.floor(num/100).toString();
		if(cents<10) cents = "0" + cents;
		for (var i = 0; i < Math.floor((num.length-(1+i))/3); i++)
			num = num.substring(0,num.length-(4*i+3))+','+
		num.substring(num.length-(4*i+3));
		return (((sign)?'':'-') + '$' + num + '.' + cents);
	},
	date: function(str, format) {
		format = format.toUpperCase();
		var re = /^(M|MM|D|DD|YYYY)([\-\/]{1})(M|MM|D|DD|YYYY)(\2)(M|MM|D|DD|YYYY)$/;
		if (!re.test(format)) { format = "MM/DD/YYYY"; }
		if (format.indexOf("M") == -1) { format = "MM/DD/YYYY"; }
		if (format.indexOf("D") == -1) { format = "MM/DD/YYYY"; }
		if (format.indexOf("YYYY") == -1) { format = "MM/DD/YYYY"; }
		
		var M = "" + (d.getMonth()+1);
		var MM = "0" + M;
		MM = MM.substring(MM.length-2, MM.length);
		var D = "" + (d.getDate());
		var DD = "0" + D;
		DD = DD.substring(DD.length-2, DD.length);
		var YYYY = "" + (d.getFullYear()); 
		
		var sep = "/";
		if (format.indexOf("-") != -1) { sep = "-"; }
		var pieces = format.split(sep);
		var result = "";
		
		switch (pieces[0]) {
			case "M" : result += M + sep; break;
			case "MM" : result += MM + sep; break;
			case "D" : result += D + sep; break;
			case "DD" : result += DD + sep; break;
			case "YYYY" : result += YYYY + sep; break;
		}
		switch (pieces[1]) {
			case "M" : result += M + sep; break;
			case "MM" : result += MM + sep; break;
			case "D" : result += D + sep; break;
			case "DD" : result += DD + sep; break;
			case "YYYY" : result += YYYY + sep; break;
		}
		switch (pieces[2]) {
			case "M" : result += M; break;
			case "MM" : result += MM; break;
			case "D" : result += D; break;
			case "DD" : result += DD; break;
			case "YYYY" : result += YYYY; break;
		}
		return result;
	},
	time: function(t, format) {
		format = format.toUpperCase();
		var re = /^(H|HH)(:MM)(:SS)?( AM)?$/;
		if(!re.test(format)) format = "H:MM AM";
		
		var MM = "0" + (t.getMinutes());
		MM = MM.substring(MM.length-2, MM.length);
		var SS = "0" + (t.getSeconds());
		SS = SS.substring(SS.length-2, SS.length);
		var H = "" + (t.getHours());
		var HH = "0" + H;
		HH = HH.substring(HH.length-2, HH.length);
		
		var meridian = "";
		if (format.indexOf(" AM") != -1) {
			meridian = "AM";
			if(HH == "00") HH = "12";
			if(HH == "12") meridian = "PM";
			if(parseInt(HH, 10) > 12) {
				meridian = "PM";
				var hrs = (parseInt(HH, 10)-12);
				H = "" + hrs;
				HH = "0" + H;
				HH = HH.substring(HH.length-2, HH.length);
			}
		}
		
		var result = "";
		if(format.indexOf("HH") == -1) result += H + ":" + MM;
		else result += HH + ":" + MM;
		if(format.indexOf("SS") != -1) result += ":" + SS;
		if(format.indexOf(" AM") != -1) result += " " + meridian;
		return result;
	},
	integer: function(num) { return parseInt(num); },
	
	// TODO: Add ANSI formatting
	error: function(data) { return '<p style="#990000">'+data+'</p>'; }
});

