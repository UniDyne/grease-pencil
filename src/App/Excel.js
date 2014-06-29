GreasePencil.App.Excel = new Class({
	initialize: function() {
		this.oExcel = new ActiveXObject("Excel.Application");
		this.oExcel.Visible = true;
	},
	
	openWorkbook: function(inFile) {
		this.oExcel.Workbooks.Open(inFile);
	},
	
	importCarat: function(inFile) {
		if(inFile == null) inFile = "u:\\temp\\excel-out.csv";
		this.oExcel.WorkBooks.OpenText(
			inFile, // file
			1252, // origin
			1, // start row
			this.xlDelimited, // delimited
			this.xlTextQualifierNone, // text qualifier
			false, // consec delimiter
			false, // tab
			false, // semicolon
			false, // comma
			false, // space
			true, // other
			'^' // delim char
		);
	},
	
	importText: function(inFile, columnSpec) {
		// column spec is an object with
		// names : array of column names
		// types : array of column types
		// delimiter : delimiter char (default is ^)
		
		var delim = '^';
		if(columnSpec.delimiter) delim = columnSpec.delimiter;
		
		if(columnSpec.columns) {
			columnSpec.types = new Array();
			columnSpec.names = new Array();
			for(var i = 0; i < columnSpec.columns.length; i++) {
				columnSpec.names[i] = columnSpec.columns[i].name;
				columnSpec.types[i] = columnSpec.columns[i].type;
			}
			columnSpec.names = columnSpec.names.join();
		}
		
		// create new workbook
		this.oExcel.Workbooks.Add();
		
		var query = this.oExcel.ActiveWorkbook.ActiveSheet.QueryTables.Add(Connection="TEXT;"+inFile, Destination=this.oExcel.ActiveWorkbook.ActiveSheet.Range("A1"));
		query.Name = 'IMPORT';
		query.FieldNames = true;
		query.RowNumbers = false;
		query.FillAdjacentFormulas = false;
		query.PreserveFormatting = true;
		query.RefreshOnFileOpen = false;
		query.RefreshStyle = this.xlInsertDeleteCells;
		query.SavePassword = false;
		query.SaveData = true;
		query.AdjustColumnWidth = true;
		query.RefreshPeriod = 0;
		query.TextFilePromptOnRefresh = false;
		query.TextFilePlatform = 437;
		query.TextFileStartRow = 1;
		query.TextFileParseType = this.xlDelimited;
		query.TextFileTextQualifier = this.xlTextQualifierDoubleQuote;
		query.TextFileConsecutiveDelimiter = false;
		query.TextFileTabDelimiter = false;
		query.TextFileSemicolonDelimiter = false;
		query.TextFileCommaDelimiter = false;
		query.TextFileSpaceDelimiter = false;
		query.TextFileOtherDelimiter = delim;
		query.TextFileColumnDataTypes = JS2VBArray(columnSpec.types);
		query.TextFileTrailingMinusNumbers = true;
		query.Refresh(BackgroundQuery = false);
		
		this.nameColumns(columnSpec.names);
	},
	
	formatify: function(size) {
		if(size == null) size = 10;
		this.oExcel.ActiveWorkbook.ActiveSheet.Rows("1:1").Select();
		this.oExcel.Selection.Font.Bold = true;
		this.oExcel.ActiveWorkbook.ActiveSheet.Cells.Select();
		this.oExcel.Selection.Font.Size = size;	
		this.oExcel.ActiveWorkbook.ActiveSheet.Cells.EntireColumn.Autofit();
		this.oExcel.ActiveWorkbook.ActiveSheet.Range("A2").Select();
		this.oExcel.ActiveWindow.FreezePanes = true;
		
		this.oExcel.ActiveWorkbook.ActiveSheet.ListObjects.Add(this.xlSrcRange, this.oExcel.ActiveWorkbook.ActiveSheet.usedRange, null, this.xlYes).Name = "Report";
	},
	
	formatify2: function() {
		this.oExcel.ActiveWorkbook.ActiveSheet.Rows("1:1").Select();
		this.oExcel.Selection.Font.Bold = true;
		this.oExcel.ActiveWorkbook.ActiveSheet.Cells.Select();
		this.oExcel.ActiveWorkbook.ActiveSheet.Cells.EntireColumn.Autofit();
		this.oExcel.ActiveWorkbook.ActiveSheet.Range("A2").Select();
		this.oExcel.ActiveWindow.FreezePanes = true;
	},
	
	printify: function() {
		this.oExcel.ActiveWorkbook.ActiveSheet.PageSetup.PrintTitleRows = "$1:$1";
		this.oExcel.ActiveWorkbook.ActiveSheet.PageSetup.PrintGridlines = true;
		this.oExcel.ActiveWorkbook.ActiveSheet.PageSetup.Orientation = this.xlLandscape;
		this.oExcel.ActiveWorkbook.ActiveSheet.PageSetup.CenterHorizontally = true;
	},
	
	printit: function() {
		this.oExcel.ActiveWorkbook.ActiveSheet.PageSetup.PrintGridlines = true;
		this.oExcel.ActiveWorkbook.ActiveSheet.PageSetup.Orientation = this.xlLandscape;
		this.oExcel.ActiveWorkbook.ActiveSheet.PageSetup.LeftMargin = 0.25;
		this.oExcel.ActiveWorkbook.ActiveSheet.PageSetup.RightMargin = 0.25;
		this.oExcel.ActiveWorkbook.ActiveSheet.PrintOut;
	},

	setMargins: function(top, left, bottom, right, head, foot) {
		this.oExcel.ActiveWorkbook.ActiveSheet.PageSetup.LeftMargin = this.oExcel.InchesToPoints(left);
		this.oExcel.ActiveWorkbook.ActiveSheet.PageSetup.RightMargin = this.oExcel.InchesToPoints(right);
		this.oExcel.ActiveWorkbook.ActiveSheet.PageSetup.TopMargin = this.oExcel.InchesToPoints(top);
		this.oExcel.ActiveWorkbook.ActiveSheet.PageSetup.BottomMargin = this.oExcel.InchesToPoints(bottom);
		this.oExcel.ActiveWorkbook.ActiveSheet.PageSetup.HeaderMargin = this.oExcel.InchesToPoints(head);
		this.oExcel.ActiveWorkbook.ActiveSheet.PageSetup.FooterMargin = this.oExcel.InchesToPoints(foot);
	},

// pass plain text or RTF
// &D = date, &P = page, &N = pages
// &"Arial,Bold"some text = sets font to arial bold
// &"-,Bold"some text = keep font, set to bold
// &12 = set size to 12
	setHeader: function(left, center, right) {
		this.oExcel.ActiveWorkbook.ActiveSheet.PageSetup.LeftHeader = left;
		this.oExcel.ActiveWorkbook.ActiveSheet.PageSetup.CenterHeader = center;
		this.oExcel.ActiveWorkbook.ActiveSheet.PageSetup.RightHeader = right;
	},

	setFooter: function(left, center, right) {
		this.oExcel.ActiveWorkbook.ActiveSheet.PageSetup.LeftFooter = left;
		this.oExcel.ActiveWorkbook.ActiveSheet.PageSetup.CenterFooter = center;
		this.oExcel.ActiveWorkbook.ActiveSheet.PageSetup.RightFooter = right;
	},

	setColumnWidth: function(col, width) {
		this.oExcel.ActiveWorkbook.ActiveSheet.Columns(col+":"+col).ColumnWidth = width;
	},

	columnTotals: function(cols) {
		if(cols == null) return;
		
		var rowCount = this.oExcel.ActiveWorkbook.ActiveSheet.usedRange.Rows.Count;
		
		this.oExcel.ActiveWorkbook.ActiveSheet.ListObjects("Report").ShowTotals = true;
		
		var clist = cols.split(',');
		for(var i = 0; i < clist.length; i++) {
			this.oExcel.ActiveWorkbook.ActiveSheet.ListObjects("Report").ListColumns(clist[i]).TotalsCalculation = this.xlTotalsCalculationSum;
		}
	},

	deselect: function() {
		this.oExcel.ActiveWorkbook.ActiveSheet.Range("A2").Select();
	},

	toStyle: function(cols, style) {
		if(cols == null) return;
		
		var clist = cols.split(',');
		for(var i = 0; i < clist.length; i++) {
			this.oExcel.ActiveWorkbook.ActiveSheet.Columns(clist[i]+":"+clist[i]).Select();
			this.oExcel.Selection.Style = style;
		}
		
		this.deselect();
	},
	
	toCurrency: function(cols) {
		this.toStyle(cols, "Currency");
	},

	toPercent: function(cols) {
		this.toStyle(cols, "Percent");
	},

	toDate: function(cols) {
		this.toStyle(cols, "Date");
	},

	toText: function(cols) {
		this.toStyle(cols, "Text");
	},

	colHighlight: function(cols) {
		if(cols == null) return;
		
		var clist = cols.split(',');
		for(var i = 0; i < clist.length; i++) {
			this.oExcel.ActiveWorkbook.ActiveSheet.Columns(clist[i]+":"+clist[i]).Interior.ColorIndex = 6;
			this.oExcel.ActiveWorkbook.ActiveSheet.Columns(clist[i]+":"+clist[i]).Interior.Pattern = this.xlSolid;
		}
		
		this.deselect();
	},

	nameColumns: function(names) {
		if(names == null) return;
		
		var clist = names.split(',');
		for(var i = 0; i < clist.length; i++) {
			var colLetter = String.fromCharCode(65 + (i%26));
			if(i >= 26) colLetter = String.fromCharCode(65 + ((i - (i%26)) % 26)) + colLetter;
			this.oExcel.ActiveWorkbook.ActiveSheet.Range(colLetter+"1").Select();
			this.oExcel.ActiveCell.FormulaR1C1 = clist[i];
		}
		
		this.deselect();
	},

	showTotals: function() {
		this.oExcel.ActiveWorkbook.ActiveSheet.ListObjects("Report").ShowTotals = true;
	},

	totalSum: function(colNames) {
		if(colNames == null) return;
		
		this.showTotals();
		
		var clist = colNames.split(',');
		for(var i = 0; i < clist.length; i++) {
			this.oExcel.ActiveWorkbook.ActiveSheet.ListObjects("Report").ListColumns(clist[i]).TotalsCalculation = this.xlTotalsCalculationSum;
		}
		
		this.deselect();
	},

	totalAvg: function(colNames) {
		if(colNames == null) return;
		
		this.showTotals();
		
		var clist = colNames.split(',');
		for(var i = 0; i < clist.length; i++) {
			this.oExcel.ActiveWorkbook.ActiveSheet.ListObjects("Report").ListColumns(clist[i]).TotalsCalculation = this.xlTotalsCalculationAverage;
		}
		
		this.deselect();
	},

	saveAs: function(toFile) {
		this.oExcel.ActiveWorkbook.SaveAs(Filename = toFile, FileFormat = this.xlWorkbookNormal);
		//, FileFormat = this.oExcel.xlNormal);
	},

	save: function() {
		this.oExcel.ActiveWorkbook.Save();
	},

	close: function(saveChanges) {
		if(typeof saveChanges != 'boolean') this.oExcel.ActiveWorkbook.Close(false);
		else this.oExcel.ActiveWorkbook.Close(saveChanges);
		this.oExcel.Quit();
	}
});

GreasePencil.App.Excel.implement({
	xlLandscape: 2,
	
	xlSolid: 1,
	xlThick: 4,
	xlDouble: -4119,
	xlNone: -4142,
	xlAutomatic: -4105,
	
	xlSrcExternal: 0,
	xlSrcRange: 1,
	xlSrcXml: 2,
	
	xlSourceWorkbook: 0,
	xlSourceSheet: 1,
	xlSourcePrintArea: 2,
	xlSourceAutoFilter: 3,
	xlSourceRange: 4,
	xlSourceChart: 5,
	xlSourcePivotTable: 6,
	xlSourceQuery: 7,
	
	xlDoNotSaveChanges: 2,
	xlSaveChanges: 1,
	
	xlNoChange: 1,
	xlShared: 2,
	xlNoChange: 3,
	
	xlSummaryAbove: 0,
	xlSummaryBelow: 1,
	
	xlDelimited: 1,
	xlFixedWidth: 2,
	
	xlInsertDeleteCells: 1,
	xlInsertEntireRows: 2,
	
	xlTextQualifierDoubleQuote: 1,
	xlTextQualifierSingleQuote: 2,
	xlTextQualifierNone: -4142,
	
	xlGeneralFormat: 1,
	xlTextFormat: 2,
	
	xlWorkbookNormal: -4143,
	
	xlGuess: 0,
	xlYes: 1,
	xlNo: 2,
	
	xlTotalsCalculationNone: 0,
	xlTotalsCalculationAverage: 2,
	xlTotalsCalculationCount: 3,
	xlTotalsCalculationCountNums: 4,
	xlTotalsCalculationMax: 6,
	xlTotalsCalculationMin: 5,
	xlTotalsCalculationStdDev: 7,
	xlTotalsCalculationSum: 1,
	xlTotalsCalculationVar: 8
});

$_Excel = GreasePencil.App.Excel;
