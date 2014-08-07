var FoxConst = {
	"0": "EMPTY",
	"1": "NULL",
	"2": "I2",
	"3": "I4",
	"4": "R4",
	"5": "R8",
	"6": "CY",
	"7": "DATE",
	"8": "BSTR",
	"9": "IDISPATCH",
	"10": "ERROR",
	"11": "BOOL",
	"12": "VARIANT",
	"13": "IUNKNOWN",
	"14": "DECIMAL",
	"16": "I1",
	"17": "UI1",
	"18": "UI2",
	"19": "UI4",
	"20": "I8",
	"21": "UI8",
	"72": "GUID",
	"64": "FILETIME",
	"128": "BYTES",
	"129": "STR",
	"130": "WSTR",
	"131": "NUMERIC",
	"132": "UDT",
	"133": "DBDATE",
	"134": "DBTIME",
	"135": "DBTIMESTAMP",
	"136": "HCHAPTER",
	"138": "PROPVARIANT",
	"139": "VARNUMERIC"
}

var FoxPro = new Class({
	Extends: DataSource,
	
	initialize: function(options) {
		this.parent(options);
	},
	
	getConnectionString: function() {
		return "Provider=vfpoledb;Data Source="+this.options.dir+this.options.master;
	}
});
