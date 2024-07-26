
// empty config...
// need to move this from global to inside GP
var Config = new Abstract({
	BaseDir		: '',
	ScriptName	: 'GreasePencil',
	
	debug: false
});

var GreasePencil = new Abstract({
	Version: [2, 5, 0],
	Fso: null,
	Shell: null,
	
	mkUID: function() {
		return (new ActiveXObject("Scriptlet.TypeLib")).GUID.substr(1,36).replace(/-/g,'');
	},
	
	readFile: function(fname) {
		var data = '';
		try {
			var file = this.Fso.OpenTextFile(fname, 1, false);
			data = file.ReadAll();
			file.Close();
		} catch(e) {}
		return data;
	},
	
	initialize: function() {
		this.Fso = new ActiveXObject("Scripting.FileSystemObject");
		this.Shell = new ActiveXObject("WScript.Shell");
		this.Net = new ActiveXObject("Wscript.Network");
		
		
		var path = WScript.ScriptFullName.replace(WScript.ScriptName, "");
		
		// set the BaseDir to the current path
		Config.BaseDir = path.replace(/lib\\?$/i, '');
		
		// config file may override BaseDir, but MUST be in same dir as GreasePencil
		var cfg = JSON.parse(this.readFile(path+"lib\\config.cfg"));
		Config = Config.extend(cfg);
	},

	/* namespaces to be used by other modules */
	App: {},
	Net: {}
});

// Shorthand macros...
$GP = GreasePencil;
$FILE = GreasePencil.readFile;

GreasePencil.initialize();

// Many libs assume you are calling from VB
/* MOVED to Array.toDictionary(), .toVBArray() */
/*
function JS2VBArray( objJSArray ) {
    var dictionary = new ActiveXObject( "Scripting.Dictionary" );
    for ( var i = 0; i < objJSArray.length; i++ )
	    dictionary.add( i, objJSArray[ i ] );
    return dictionary.Items();
}
*/

/* REMOVED - Not used here. If needed, move to Array.toCSV() or somesuch */
/* There are more succinct ways to write this... */
/*
function Array2CSV(data, delim) {
	delim = (delim || ",");
	var line = "";
	for(var i = 0; i < data.length; i++) {
		if(i > 0) line += delim;
		line += '"' + (data[i]+'').replace('"','""') + '"';
	}
	return line;
}
*/

/* REMOVED - Not used here. If needed, move to Array.fromCSV() or somesuch */
/*
function CSVtoArray(data, delim) {
	delim = (delim || ",");
	var pattern = new RegExp(
		(
			// delimiters
			"(\\" + delim + "|\\r?\\n|\\r|^)" +
			
			// quoted
			"(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
			
			// non-quoted
			"([^\"\\" + delim + "\\r\\n]*))"
		), "gi"
	);
	
	var aData = [[]];
	var aMatches = null;
	while(aMatches = pattern.exec(data)) {
		var matchDelim = aMatches[1];
		if(matchDelim.length && (matchDelim != delim)) {
			aData.push([]);
		}
		
		if(aMatches[2]) {
			aData[aData.length - 1].push(aMatches[2].replace(/\"\"/g, '"'));
		} else aData[aData.length - 1].push(aMatches[3]);
	}
	return aData;
}
*/
