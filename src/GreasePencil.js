
// empty config...
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
		Config.BaseDir = path;
		
		// config file may override BaseDir, but MUST be in same dir as GreasePencil
		var cfg = Json.decode(this.readFile(path+"config.cfg"));
		Config = Config.extend(cfg);
	}
});

// Shorthand macros...
$FILE = GreasePencil.readFile;

GreasePencil.initialize();

// Many libs assume you are calling from VB
function JS2VBArray( objJSArray ) {
    var dictionary = new ActiveXObject( "Scripting.Dictionary" );
    for ( var i = 0; i < objJSArray.length; i++ )
	    dictionary.add( i, objJSArray[ i ] );
    return dictionary.Items();
}

