GreasePencil.Resources = new Abstract({
	scriptXML: null,
	
	initialize: function() {
		this.scriptXML = new ActiveXObject("Msxml2.DOMDocument.6.0");
		this.scriptXML.async = false;
		this.scriptXML.validateOnParse = false;
		this.scriptXML.load(WScript.ScriptFullName);
		this.scriptXML.setProperty("SelectionLanguage","XPath");
	},
	
	getText: function(id, type) {
		var node = this.scriptXML.selectSingleNode("//"+(type?type:"text")+"[@id='"+id+"']");
		return node.text;
	},

	getAttrib: function(id, type, attrib) {
		var node = this.scriptXML.selectSingleNode("//"+(type?type:'json')+"[@id='"+id+"']");
		return node.getAttribute(attrib);
	},
	
	getData: function(id) {
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
	

	fetchData: function(id, args, dataObj) {
		var query = this.getQuery(id);
		return (dataObj||Sequel).getAll(query, args);
	},

	fetchToTemp: function(id, args, dataObj) {
		var query = this.getQuery(id).replace('FROM ', 'INTO #'+id+' FROM ');
		return (dataObj||Sequel).execQuery(query, args);
	},

	fetchRecord: function(id, args, dataObj) {
		var query = this.getQuery(id);
		return (dataObj||Sequel).getFirst(query, args);
	}
});
