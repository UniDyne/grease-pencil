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

var FoxPro = new Abstract({
	connection: null,
	command: null,
	recordset: null,
	
	initialize: function() {
		var dbString = "Provider=vfpoledb;Data Source="+Config.FoxPro.dir+Config.FoxPro.master;
		
		this.connection = new ActiveXObject("ADODB.Connection");
		this.connection.ConnectionString = dbString;
		
		this.command = new ActiveXObject("ADODB.Command");
		this.recordset = new ActiveXObject("ADODB.RecordSet");
		
	},
	
	finalize: function() {
		try {this.recordset.Close();} catch(e) {}
		try {this.connection.Close();} catch(e) {}
	},
	
	hasRecord: function(table, keyField, keyValue) {
		var query = "SELECT COUNT(*) FROM \"" + table + "\" WHERE \"" + keyField + "\" = '" + keyValue.replace(/'/g,"''") + "'";
		
		this.connection.Open();
		this.recordset.Open(query);
		this.recordset.MoveFirst();
		var result = (this.recordset.Fields(0) > 0);
		this.recordset.Close();
		this.connection.Close();
		
		return result;
	},
	
	hasRecord: function(table, keys) {
		var first = true;
		var query = "SELECT COUNT(*) FROM \"" + table + "\" WHERE ";
		for(var key in keys) {
			if(first) first = false;
			else query += " AND ";
			query += "\"" + key + "\" = '" + keys[key].replace(/'/g,"''") + "'";
		}
		
		this.connection.Open();
		this.recordset.ActiveConnection = this.connection;
		this.recordset.Open(query);
		this.recordset.MoveFirst();
		var result = (this.recordset.Fields(0) > 0);
		this.recordset.Close();
		this.connection.Close();
		
		return result;
	},
	
	getSchema: function(table) {
		var schema = {};	
		var query = "SELECT * FROM information_schema.columns WHERE table_name = '"+table+"'";
		
		this.openQuery(query);
		while(!this.recordset.EOF) {
			var column = {};
			column['type'] = this.recordset.Fields('data_type').Value;
			if(this.recordset.Fields('character_maximum_length').Value)
				column['charlen'] = this.recordset.Fields('character_maximum_length').Value;
			else column['charlen'] = 0;
			schema[this.recordset.Fields('column_name').Value] = column;
			this.recordset.MoveNext();
		}
		this.closeQuery();;
		
		return schema;
	},
	
	getAll: function(sql, obj) {
		var data = [];
		
		if(typeof obj != 'undefined' && obj != null) sql = this.mkSql(sql,obj);
		
		if(this.openQuery(sql)) {
			
			while(!this.recordset.EOF) {
				data[data.length] = {};
				for(var i = 0; i < this.recordset.Fields.Count; i++) {
					data[data.length - 1][this.recordset.Fields(i).Name] = this.recordset.Fields(i).value;
				}
				this.recordset.MoveNext();
			}
			
			this.closeQuery();
		}
		
		return data;
	},
	
	getFirst: function(sql, obj) {
		var rec = null;
		
		if(typeof obj != 'undefined' && obj != null) sql = this.mkSql(sql,obj);
		
		if(this.openQuery(sql)) {
			rec = {};
			for(var i = 0; i < this.recordset.Fields.Count; i++) {
				rec[this.recordset.Fields(i).Name] = this.recordset.Fields(i).value;
			}
			this.closeQuery();
		}
		
		return rec;
	},
	
	getLOB: function(table, keys, field) {
		var data = null;
		var query = "SELECT "+field+" FROM "+table+" WHERE ";
		
		var first = true;
		for(var key in keys) {
			if(first) first = false;
			else query += " AND ";
			query += "\""+key+"\" = '"+keys[key].replace(/'/g,"''")+"'";
		}
		
		if(this.openQuery(query)) {
			var x = this.recordset.Fields(field).ActualSize;
			if(x > 0) data = this.recordset.Fields(field).GetChunk(x);
			this.closeQuery();
		}
		
		return data;
	},
	
	openQuery: function(query) {
		if(Config.FoxPro.debug) WScript.StdOut.WriteLine(query);
		
		this.connection.Open();
		this.recordset.ActiveConnection = this.connection;
		this.recordset.Open(query);
		
		if(this.recordset.EOF) {
			this.closeQuery();
			return false;
		}
		
		this.recordset.MoveFirst();
		return true;
	},
	
	closeQuery: function() {
		this.recordset.Close();
		this.connection.Close();
	},
	
	execQuery: function(sql, obj) {
		if(typeof obj != 'undefined' && obj != null) sql = this.mkSql(sql,obj);
		try {
			this.connection.Open();
			this.connection.Execute(sql);
			this.connection.Close();
		}catch(e) {
			if(Config.FoxPro.debug) WScript.StdOut.WriteLine(sql);
			WScript.StdOut.WriteLine(e.message);
		}
	},
	
	mkSql: function(sql, obj) {
		obj = $modCopy(obj, Validator.sqlSafe);
		sql = Template.execStatic(sql, obj);
		return sql;
	}
});
