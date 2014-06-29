GreasePencil.Resources = new Abstract({
	scriptXML: null,
	
	initialize: function() {
		this.scriptXML = new ActiveXObject("Msxml2.DOMDocument.6.0");
		this.scriptXML.async = false;
		this.scriptXML.validateOnParse = false;
		this.scriptXML.load(WScript.ScriptFullName);
		this.scriptXML.setProperty("SelectionLanguage","XPath");
	},
	
	getData: function(id) {w
		var node = this.scriptXML.selectSingleNode("//json[@id='"+id+"']");
		return Json.decode(node.text);
	},
	
	getQuery: function(id) {
		var node = this.scriptXML.selectSingleNode("//query[@id='"+id+"']");
		return node.text;
	},
	
	getTemplate: function(id, defaults, scope) {
		var node = this.scriptXML.selectSingleNode("//template[@id='"+id+"']");
		var tmpl = new Template(node.text, defaults, scope);
		return tmpl;
	},
	
	fetchData: function(id, args) {
		var query = this.getQuery(id);
		return Sequel.getAll(query, args);
	},

	fetchRecord: function(id, args) {
		var query = this.getQuery(id);
		return Sequel.getFirst(query, args);
	}
});
