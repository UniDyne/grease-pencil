
var SequelConst = {
	adParamReturnValue: 4,
	adParamInput: 1,
	adParamOutput: 2,
	adVarChar: 200,
	adInteger: 3,
	adNumeric: 131,
	
	//cursor types
	adOpenUnspecified: -1,
	adOpenForwardOnly: 0,
	adOpenKeyset: 1,
	adOpenDynamic: 2,
	adOpenStatic: 3,
	
	// lock types
	adLockUnspecified: -1,
	adLockReadOnly: 1,
	adLockPessimistic: 2,
	adLockOptimistic: 3,
	adLockBatchOptimistic: 4,
	
	//command types
	adCmdUnspecified: -1,
	adCmdText: 1,
	adCmdTable: 2,
	adCmdStoredProc: 4,
	adCmdUnknown: 8,
	adCmdFile: 256,
	adCmdTableDirect: 512,
	
	// exec options
	adOptionUnspecified: -1,
	adAsyncExecute: 16,
	adAsyncFetch: 32,
	adAsyncFetchNonBlocking: 64,
	adExecuteNoRecords: 128,
	adExecuteStream: 256,
	adExecuteRecord: 512
};

var Sequel = new Abstract({
	connection: null,
	command: null,
	recordset: null,
	
	initialize: function() {
		var dbString = "Driver={SQL Server};Server="+Config.Sequel.server+";Database="+Config.Sequel.db+";UID="+Config.Sequel.uid+";PWD="+Config.Sequel.pwd;
		
		this.connection = new ActiveXObject("ADODB.Connection");
		this.connection.ConnectionString = dbString;
		
		this.command = new ActiveXObject("ADODB.Command");
		this.recordset = new ActiveXObject("ADODB.RecordSet");
	},
	
	finalize: function() {
		
	},
	
	getTableCount: function(table, keyField, keyValue) {
		keyField = keyField || '1';
		keyValue = keyValue || '1';
		
		var query = "SELECT COUNT(*) FROM \"" + table + "\" WHERE \"" + keyField + "\" = '" + keyValue.replace(/'/g,"''") + "'";
		this.connection.Open();
		this.recordset.Open(query);
		this.recordset.MoveFirst();
		var result = this.recordset.Fields(0);
		this.recordset.Close();
		this.connection.Close();
		
		return result;
	},
	
	/*hasRecord: function(table, keyField, keyValue) {
		var query = "SELECT COUNT(*) FROM \"" + table + "\" WHERE \"" + keyField + "\" = '" + keyValue.replace(/'/g,"''") + "'";
		
		this.connection.Open();
		this.recordset.Open(query);
		this.recordset.MoveFirst();
		var result = (this.recordset.Fields(0) > 0);
		this.recordset.Close();
		this.connection.Close();
		
		return result;
	},*/
	
	hasRecord: function(table, keyField, keyValue) {
		return (this.getTableCount(table, keyField, keyValue) > 0);
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
		this.recordset.Open(query);
		this.recordset.MoveFirst();
		var result = (this.recordset.Fields(0) > 0);
		this.recordset.Close();
		this.connection.Close();
		
		return result;
	},
	
	addRecord: function(table, data) {
		var insertSQL = "INSERT INTO \"" + table + "\"(";
		var valueSQL = "VALUES(";
		var first = true;
		
		var schema = this.GetSchema(table);
		
		for(var field in data) {
			if(!schema[field]) continue;
			
			if(!first) {
				insertSQL += ", ";
				valueSQL += ", ";
			} else first = false;
			
			insertSQL += "\""+field+"\"";
			
			if(data[field] == null) valueSQL += "null";
			else if(schema[field].type == 'nvarchar' || schema[field].type == 'char' || schema[field].type == 'varchar' || schema[field].type == 'nchar' || schema[field].type == 'datetime') {
				valueSQL += "'"+data[field].replace(/'/g,"''")+"'";
			} else if(schema[field].type == 'bit') {
				if(typeof data[field] == 'boolean') valueSQL += data[field] ? "1" : "0";
				else valueSQL += (data[field].toLower() == "true" || data[field].toLower() == "yes" || data[field].toLower() == "1") ? "1" : "0";
			} else valueSQL += data[field];
		}
		this.execQuery(insertSQL + ") " + valueSQL + ")");
	},
	
	updateRecord: function(table, keys, data) {
		var updateSQL = "UPDATE \""+table+"\" SET";
		var whereSQL = " WHERE ";
		var first = true;
		
		var schema = this.GetSchema(table);
		
		for(var key in keys) {
			if(first) first = false;
			else whereSQL += " AND ";
			whereSQL = "\""+key+"\" = '"+keys[key].replace(/'/g,"''")+"'";
		}
		
		first = true;
		for(var field in data) {
			if(!schema[field]) continue;
			
			if(first) first = false;
			else updateSQL += ", "
			
			updateSQL += "\""+field+"\" = ";
			
			if(data[field] == null) updateSQL += "null";
			else if(schema[field].type == 'nvarchar' || schema[field].type == 'char' || schema[field].type == 'varchar' || schema[field].type == 'nchar' || schema[field].type == 'datetime') {
				updateSQL += "'"+data[field].replace(/'/g, "''")+"'";
			} else if(schema[field].type == 'bit') {
				if(typeof data[field] == 'boolean') valueSQL += data[field] ? "1" : "0";
				else updateSQL += (data[field].toLower() == "true" || data[field].toLower() == "yes" || data[field].toLower() == "1") ? "1" : "0";
			} else updateSQL += data[field];
		}
		
		this.execQuery(updateSQL + whereSQL);
	},
	
	deleteRecord: function(table, keys) {
		var deleteSQL = "DELETE FROM \""+table+"\" WHERE ";
		var first = true;
		for(var key in keys) {
			if(first) first = false;
			else deleteSQL += " AND ";
			
			deleteSQL += "\""+key+"\" = '"+keys[key].replace(/'/g,"''")+"'";
		}
		
		this.execQuery(deleteSQL);
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
	
	getLOB: function(table, key, field) {
		var data = null;
		var query = "SELECT "+field+" FROM "+table+" WHERE "+key.name+" = '"+key.value.replace(/'/g,"''")+"'";
		
		if(this.openQuery(query)) {
			var x = this.recordset.Fields(field).ActualSize;
			if(x > 0) data = this.recordset.Fields(field).GetChunk(x);
			this.closeQuery();
		}
		
		return data;
	},

	putData: function(table, keys, data) {
		if(this.hasRecord(table, keys)) this.updateRecord(table, keys, data);
		else this.addRecord(table, $merge(keys,data));
	},
	
	putLOB: function(table, key, field, data) {
		var query = "SELECT * FROM "+table+" WHERE "+key.name+" = '"+key.value.replace(/'/g,"''")+"'";
		
		var updaters = new ActiveXObject("ADODB.RecordSet");
		this.connection.Open();
		updaters.Open(query, this.connection, SequelConst.adOpenForwardOnly, SequelConst.adLockOptimistic, SequelConst.adCmdText)
		//updaters.Filter = key.name+" = '"+key.value.replace(/'/g,"''")+"'";
		if(!updaters.EOF) {
			updaters.MoveFirst();
			updaters.Update();
			updaters.Fields(field).AppendChunk(data);
			updaters.Update();
			updaters.Close();
			this.connection.Close();
		}
	},
	
	openQuery: function(query) {
		if(Config.Sequel.debug) WScript.StdOut.WriteLine(query);
		
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
		
		this.connection.Open();
		this.connection.Execute(sql);
		this.connection.Close();
	},
	
	mkSql: function(sql, obj) {
		if(Config.Sequel.debug) WScript.StdOut.WriteLine(sql);
		if(Config.Sequel.safety) obj = $modCopy(obj, Validator.sqlSafe);
		sql = Template.execStatic(sql, obj);
		if(Config.Sequel.debug) WScript.StdOut.WriteLine(sql + "\n" + Json.toString(obj));
		return sql;
	}
});

