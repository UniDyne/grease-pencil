GreasePencil.App.Access = new Class({
	initialize: function(mdbfile) {
		this.oAccess = new ActiveXObject("Access.Application");
		this.oAccess.OpenCurrentDatabase(mdbfile);
		this.fileSpec = mdbfile;
	},

	importText: function(inFile, importSpec) {
		if(inFile == null) inFile = "u:\\temp\\excel-out.csv";
		
		this.oAccess.DoCmd.TransferText(
			this.acImportDelim,	// import/export type
			importSpec,	// import spec
			"invlist",	// table name
			inFile,		// file name
			true
		);
	},
	
	linkText: function(inFile, importSpec, tableName) {
		if(inFile == null) inFile = "u:\\temp\\excel-out.dat";
		
		// Since we are linking, delete the original first
		var hasTable = false;
		for(var i = 0; i < this.oAccess.CurrentData.AllTables.Count; i++) {
			if(this.oAccess.CurrentData.AllTables(i).Name === tableName)
				hasTable = true;
		}
		if(hasTable)
			this.oAccess.DoCmd.DeleteObject(this.oAccess.acTable, tableName);
		
		this.oAccess.DoCmd.TransferText(
			this.oAccess.acLinkDelim,	// import/export type
			importSpec,	// import spec
			tableName,	// table name
			inFile,		// file name
			true
		);
	},
	
	printReportIterate: function(reportName, fieldName) {
		// for each value of fieldname in the query for reportname,
		// print one copy of reportname
		
		var reportObj = null;
		
		this.oAccess.DoCmd.OpenReport(reportName, this.acViewPreview, "", "");
		reportObj = this.oAccess.Reports(reportName);
		if(reportObj == null) return;
		var source = reportObj.RecordSource;
		var query = "SELECT DISTINCT "+fieldName+" FROM ("+source+")";
		this.oAccess.DoCmd.Close(3, reportName, 2);
		
	//	WScript.StdOut.WriteLine("REPORT: "+reportObj);
	//	WScript.StdOut.WriteLine("SOURCE: "+source);
	//	WScript.StdOut.WriteLine("QUERY: "+query);
		
		var mdbString = "Provider=Microsoft.Jet.OLEDB.4.0;Data Source="+this.fileSpec+";User Id=admin;Password=";
		var reports = new ActiveXObject("ADODB.Connection");
		var results = new ActiveXObject("ADODB.RecordSet");
		
		reports.Open(mdbString);
		results.ActiveConnection = reports;
		results.Open(query);
		if(!results.EOF) results.MoveFirst();
		while(!results.EOF){
			this.printReport(reportName, "["+fieldName+"]='"+results.Fields(fieldName).value+"'");
			results.MoveNext();
		}
		results.Close();
		reports.Close();
	},

	printReport: function(reportName, condition) {
		if(condition == null) condition = "";
		this.oAccess.DoCmd.OpenReport(reportName, this.acViewNormal, "", condition);
	},

	exportReportIterate: function(reportName, fieldName, fileName) {
		// for each value of fieldname in the query for reportname,
		// export copy of reportname
		
		var reportObj = null;
		
		this.oAccess.DoCmd.OpenReport(reportName, this.acViewPreview, "", "");
		reportObj = this.oAccess.Reports(reportName);
		if(reportObj == null) return;
		var source = reportObj.RecordSource;
		var query = "SELECT DISTINCT "+fieldName+" FROM ("+source+")";
		this.oAccess.DoCmd.Close(3, reportName, 2);
		
	//	WScript.StdOut.WriteLine("REPORT: "+reportObj);
	//	WScript.StdOut.WriteLine("SOURCE: "+source);
	//	WScript.StdOut.WriteLine("QUERY: "+query);
		
		var mdbString = "Provider=Microsoft.Jet.OLEDB.4.0;Data Source="+this.fileSpec+";User Id=admin;Password=";
		var reports = new ActiveXObject("ADODB.Connection");
		var results = new ActiveXObject("ADODB.RecordSet");
		
		reports.Open(mdbString);
		results.ActiveConnection = reports;
		results.Open(query);
		if(!results.EOF) results.MoveFirst();
		while(!results.EOF){
			this.exportReport(reportName, "["+fieldName+"]='"+results.Fields(fieldName).value+"'", fileName+"_"+results.Fields(fieldName).value);
			results.MoveNext();
		}
		results.Close();
		reports.Close();
	},

	exportReport: function(reportName, condition, fileName) {
		if(condition == null) condition = "";
		this.oAccess.DoCmd.OpenReport(reportName, this.acViewPreview, "", condition);
		this.oAccess.DoCmd.OutputTo(this.acOutputReport, null, this.acFormatSNP, fileName+".snp");
		this.oAccess.DoCmd.Close(3, reportName, 2);
	},

	exportTable: function(tableName, fileName) {
		this.oAccess.DoCmd.TransferSpreadsheet(this.acExport, this.acSpreadsheetTypeExcel9, tableName, fileName+".xls", true);
	},

	close: function() {
		this.oAccess.CloseCurrentDatabase();
		this.oAccess.Quit(this.oAccess.acExit);
	}
});

// Constants
GreasePencil.App.Access.implement({
	acFormatSNP: "Snapshot Format (*.snp)",
	// data transfer
	acImport: 0,
	acExport: 1,
	acLink: 2,
	//form views
	acNormal: 0,
	acDesign: 1,
	acPreview: 2,
	acFormDS: 3,
	acFormPivotTable: 4,
	acFormPivotChart: 5,
	// transfer type
	acImportDelim: 0,
	acImportFixed: 1,
	acExportDelim: 2,
	acExportFixed: 3,
	acExportMerge: 4,
	acLinkDelim: 5,
	acLinkFixed: 6,
	acImportHTML: 7,
	acExportHTML: 8,
	acLinkHTML: 9,
	//views
	acViewNormal: 0,
	acViewDesign: 1,
	acViewPreview: 2,
	acViewPivotTable: 3,
	acViewPivotChart: 4,
	//spreadsheets
	acSpreadsheetTypeExcel3: 0,
	acSpreadsheetTypeLotusWK1: 2,
	acSpreadsheetTypeLotusWK3: 3,
	acSpreadsheetTypeLotusWJ2: 4,
	acSpreadsheetTypeExcel5: 5,
	acSpreadsheetTypeExcel7: 5,
	acSpreadsheetTypeExcel4: 6,
	acSpreadsheetTypeLotusWK4: 7,
	acSpreadsheetTypeExcel97: 8,
	acSpreadsheetTypeExcel8: 8,
	acSpreadsheetTypeExcel9: 8,
	// output types
	acOutputTable: 0,
	acOutputQuery: 1,
	acOutputForm: 2,
	acOutputReport: 3,
	acOutputModule: 5,
	acOutputDataAccessPage: 6,
	acOutputServerView: 7,
	acOutputStoredProcedure: 9,
	acOutputFunction: 10
});

// alias
$_Access = GreasePencil.App.Access;

