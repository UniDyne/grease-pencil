var spinner = ['-','/','|','\\'];

GreasePencil.Reporting = new Class({
	reportDef: null,
	
	initialize: function(reportID) {
		this.reportDef = Foundation.Resources.getData(reportID);
		if(!this.reportDef.params) this.reportDef.params = {};
	},
	
	buildDataFile: function() {
		WScript.StdOut.Write("Preparing output file...                     \r");
		var outFile = Foundation.Fso.OpenTextFile(Foundation.Fso.GetSpecialFolder(2)+'\\'+this.reportDef.dataFile, 2, true, -1);
		
		for(var i = 0; i < this.reportDef.columns.length; i++) {
			outFile.Write(this.reportDef.columns[i].name + '^');
		}
		outFile.WriteLine('');
		
		WScript.StdOut.Write("Fetching initial data...                     \r");
		
		var results = Foundation.Resources.fetchData(this.reportDef.query, this.reportDef.params);
		
		for(var x = 0; x < results.length; x++) {
			WScript.StdOut.Write(spinner[x%4]+" Processing "+(x+1)+"/"+results.length+" ( "+Math.ceil((100*x)/results.length)+"% )       \r");
			
			for(var i = 0; i < this.reportDef.columns.length; i++) {
				if(this.reportDef.columns[i].value != null) {
					var value = typeOf(this.reportDef.columns[i].value) == 'function' ? this.reportDef.columns[i].value(results[x]) : results[x][this.reportDef.columns[i].value.toUpperCase()];
					
					switch(this.reportDef.columns[i].type) {
						case 'string':
							outFile.Write('"' + (value ? value.trim().replace(/\^/g, '%').replace(/"/g, '""') : '') + '"');
							break;
						case 'date':
							outFile.Write('"' + Formats.date(new Date(value), 'mm/dd/yyyy') + '"');
							break;
						default:
							outFile.Write(value != null && typeOf(value) != 'undefined' ? value : '');
							break;
					}
				}
				outFile.Write("^");
			}
			outFile.WriteLine('');
		}
		
		outFile.Close();
		
		WScript.StdOut.WriteLine("Processing complete!                     ");
	},
	
	buildDataFile2: function() {
		Config.Sequel.reconnect = false;
		WScript.StdOut.Write("Preparing output file...                     \r");
		var outFile = Foundation.Fso.OpenTextFile(Foundation.Fso.GetSpecialFolder(2)+'\\'+this.reportDef.dataFile, 2, true, -1);
		
		for(var i = 0; i < this.reportDef.columns.length; i++) {
			outFile.Write(this.reportDef.columns[i].name + '^');
		}
		outFile.WriteLine('');
		
		WScript.StdOut.Write("Fetching initial data...                     \r");
		
		Foundation.Resources.fetchToTemp(this.reportDef.query, this.reportDef.params);
		var recCount = Sequel.getTableCount('#'+this.reportDef.query);
		var pos = { start: 1, count: 100 };
		var pager = "SELECT TOP %{count} * FROM (SELECT ROW_NUMBER() OVER(ORDER BY "+this.reportDef.columns[0].value+") AS row, * FROM #"+this.reportDef.query+") WHERE row >= %{start}";
		var results;
		
		for(; pos.start * pos.count < recCount; pos.start += pos.count) {
			results = Sequel.getAll(pager, pos);
			
			for(var x = 0; x < results.length; x++) {
				WScript.StdOut.Write(spinner[(pos.start+x)%4]+" Processing "+(pos.start+x)+"/"+recCount+" ( "+Math.ceil((100*(pos.start+x))/recCount)+"% )       \r");
				
				if(this.reportDef.recProc) this.reportDef.recProc(results[x]);
				
				for(var i = 0; i < this.reportDef.columns.length; i++) {
					if(this.reportDef.columns[i].value != null) {
						var value = $type(this.reportDef.columns[i].value) == 'function' ? this.reportDef.columns[i].value(results[x]) : results[x][this.reportDef.columns[i].value];
						
						switch(this.reportDef.columns[i].type) {
							case 'string':
								outFile.Write('"' + (value ? value.trim().replace(/\^/g, '%').replace(/"/g, '""') : '') + '"');
								break;
							case 'date':
								value == null ? false : outFile.Write('"' + Formats.date(new Date(value), 'mm/dd/yyyy') + '"');
								break;
							default:
								outFile.Write(value != null && $type(value) != 'undefined' ? value : '');
								break;
						}
					}
					outFile.Write("^");
				}
				outFile.WriteLine('');
			}
		} // end pager
		
		outFile.Close();
		
		Sequel.execQuery("DROP TABLE #"+this.reportDef.query);
		
		WScript.StdOut.WriteLine("Processing complete!                     ");
	},
	
	buildExcelFile: function() {
		// need to create odbc connection, new file, etc.
		
		var xlsdb = new ActiveXObject("ADODB.Connection");
		xlsdb.ConnectionString = "Driver={Microsoft Excel Driver (*.xls, *.xlsx, *.xlsm, *.xlsb)};FIRSTROWHASNAMES=1;READONLY=0;CREATE_DB=\""+this.reportDef.dataFile+"\";DBQ="+this.reportDef.dataFile;
		xlsdb.Open();
		
		var strSql = "CREATE TABLE Sheet ("
		var colList = [];
		// have to create the table
		for(var i = 0; i < this.reportDef.columns.length; i++) {
			var colDef = "["+this.reportDef.columns[i].name+"]";
			
			switch(this.reportDef.columns[i].type) {
				case 'currency':
					colDef += " CURRENCY";
					break;
				case 'boolean':
				case 'bit':
				case 'logical':
					colDef += " LOGICAL";
					break;
				case 'integer':
				case 'decimal':
				case 'number':
					colDef += " NUMBER";
					break;
				case 'date':
				case 'datetime':
					colDef += " DATETIME";
					break;
				default:
					colDef += " TEXT";
			}
			
			colList.push(colDef);
		}
		
		strSql += colList.join(',') + ")";
		xlsdb.Execute(strSql);
		
		for(var i = 0; i < colList.length; i++)
			colList[i] = (colList[i].split(' '))[0];
		
		strSql = "INSERT INTO Sheet("+colList.join(',')+")";
		
		
		
		var results = Foundation.Resources.fetchData(this.reportDef.query, this.reportDef.params);
		
		for(var x = 0; x < results.length; x++) {
			if(this.reportDef.recProc) this.reportDef.recProc(results[x]);
			
			var values = [];
			
			for(var i = 0; i < this.reportDef.columns.length; i++) {
				if(this.reportDef.columns[i].value != null) {	
					var value = $type(this.reportDef.columns[i].value) == 'function' ? this.reportDef.columns[i].value(results[x]) : results[x][this.reportDef.columns[i].value];
						
					switch(this.reportDef.columns[i].type) {
						case 'string':
						case 'text':
							values.push("'" + (value ? value.trim().replace(/\^/g, '%').replace(/'/g, "''") : '') + "'");
							break;
						case 'date':
						case 'datetime':
							value == null ? values.push('NULL') : values.push("'" + Formats.date(new Date(value), 'mm/dd/yyyy') + "'");
							break;
						default:
							values.push(value != null && $type(value) != 'undefined' ? value : 'NULL');
							break;
					}
				} else values.push('NULL');
			}
			WScript.StdOut.WriteLine(strSql+ " VALUES(" + values.join(',') + ")");
			xlsdb.Execute(strSql + " VALUES(" + values.join(',') + ")");
		}
		
		
		xlsdb.Close();
	},
	
	
	buildExcelReport: function() {
		var xls = new Foundation.App.Excel();
		var excelColumns = [];
		for(var i = 0; i < this.reportDef.columns.length; i++) {
			excelColumns.push({name: this.reportDef.columns[i].name, type: (this.reportDef.columns[i].type == 'string' ? xls.xlTextFormat : xls.xlGeneralFormat)});
		}
		xls.importText(Foundation.Fso.GetSpecialFolder(2)+'\\'+this.reportDef.dataFile, {columns: excelColumns});
		var currency = [], percent = [];
		
		for(var i = 0; i < this.reportDef.columns.length; i++) {
			var column = (i >= 26 ? String.fromCharCode(((i - (i % 26)) % 26) + 65) : '') + String.fromCharCode((i % 26)+65);
			switch(this.reportDef.columns[i].format ? this.reportDef.columns[i].format : '') {
				case 'currency':
					currency.push(column);
					break;
				case 'percent':
					percent.push(column);
					break;
			}
		}
		if(percent.length > 0) xls.toPercent(percent.join(','));
		if(currency.length > 0) xls.toCurrency(currency.join(','));
		xls.formatify2();
	}

});
