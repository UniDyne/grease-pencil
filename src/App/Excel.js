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
		// rangeStart : where to insert data (default is A1)
		// tableName : what to name range (default is Report)
		
		var delim = '^';
		if(columnSpec.delimiter) delim = columnSpec.delimiter;
		
		var rangeStart = "A1";
		if(columnSpec.rangeStart) rangeStart = columnSpec.rangeStart;
		
		var tableName = "Report";
		if(columnSpec.tableName) tableName = columnSpec.tableName;
		
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
		if(!this.oExcel.ActiveWorkbook) this.oExcel.Workbooks.Add();
		
		var query = this.oExcel.ActiveWorkbook.ActiveSheet.QueryTables.Add(Connection="TEXT;"+inFile, Destination=this.oExcel.ActiveWorkbook.ActiveSheet.Range(rangeStart));
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
		query.TextFilePlatform = 2;
		query.TextFileStartRow = 1;
		query.TextFileParseType = this.xlDelimited;
		if(columnSpec.hasOwnProperty("quoted") && columnSpec.quoted) query.TextFileTextQualifier = this.xlTextQualifierNDoubleQuote;
		else query.TextFileTextQualifier = this.xlTextQualifierNone;
		query.TextFileConsecutiveDelimiter = false;
		query.TextFileTabDelimiter = false;
		query.TextFileSemicolonDelimiter = false;
		query.TextFileCommaDelimiter = false;
		query.TextFileSpaceDelimiter = false;
		query.TextFileOtherDelimiter = delim;
		query.TextFileColumnDataTypes = columnsSpec.types.toVBArray();//JS2VBArray(columnSpec.types);
		query.TextFileTrailingMinusNumbers = true;
		query.Refresh(BackgroundQuery = false);
		
		query.Delete();
		
		if(columnSpec.hasTable) {
			var tbl = this.oExcel.ActiveWorkbook.ActiveSheet.ListObjects.Add(this.xlSrcRange, this.oExcel.ActiveWorkbook.ActiveSheet.Range(rangeStart).CurrentRegion, null, this.xlYes);
			tbl.Name = tableName;
			//this.oExcel.ActiveWorkbook.ActiveSheet.UsedRange, null, this.xlYes).Name = "Report";
		}
		
		this.nameColumns(columnSpec.names);
	},
	

	/// Changes to formatify and formatify2
	/// formatify2 is now a stub that calls formatify. Will be removed later.
	/// 'size' is an optional param that only changes size when specified
	/// 'toTable' => new param that makes it a table when truthy
	formatify: function(params) {
		if(!params || !params.hasOwnProperty) params = { size:10 };
		this.oExcel.ActiveWorkbook.ActiveSheet.Rows("1:1").Select();
		this.oExcel.Selection.Font.Bold = true;
		this.oExcel.ActiveWorkbook.ActiveSheet.Cells.Select();
		if(params.size) this.oExcel.Selection.Font.Size = params.size;	
		this.oExcel.ActiveWorkbook.ActiveSheet.Cells.EntireColumn.Autofit();
		this.oExcel.ActiveWorkbook.ActiveSheet.Range("A2").Select();
		this.oExcel.ActiveWindow.FreezePanes = true;
		
		if(params.toTable) this.oExcel.ActiveWorkbook.ActiveSheet.ListObjects.Add(this.xlSrcRange, this.oExcel.ActiveWorkbook.ActiveSheet.usedRange, null, this.xlYes).Name = "Report";
	},
	
	// DEPRECATED
	formatify2: function() { this.formatify({}); },
	
	// DEPRECATED - Use pageSetup()
	printify: function() {
		this.pageSetup({
			titleRows: 1,
			grid: true,
			center: true,
			orientation: "landscape"
		});
	},
	
	setColWidth: function(col, width) {	this.oExcel.ActiveWorkbook.ActiveSheet.Columns(col+":"+col).ColumnWidth = width; },
	setRowHeight: function(row, height) {	this.oExcel.ActiveWorkbook.ActiveSheet.Rows(row+":"+row).RowHeight = height; },

	pageSetup: function(setup) {
		var sheet = this.oExcel.ActiveWorkbook.ActiveSheet;
		
		if(setup.orientation) sheet.PageSetup.Orientation = (setup.orientation == "portrait") ? this.xlPortrait : this.xlLandscape;
		if(setup.paperSize) sheet.PageSetup.PaperSize = (setup.paperSize == "ledger") ? this.xlLedger : setup.paperSize == "legal" ? this.xlLegal : this.xlLetter;
		if(setup.firstPage) sheet.PageSetup.FirstPageNumber = setup.firstPage;
		
		if(setup.centerHeader) sheet.PageSetup.CenterHeader = setup.centerHeader;
		if(setup.centerFooter) sheet.PageSetup.CenterFooter = setup.centerFooter;
		if(setup.leftHeader) sheet.PageSetup.LeftHeader = setup.leftHeader;
		if(setup.leftFooter) sheet.PageSetup.LeftFooter = setup.leftFooter;
		if(setup.rightHeader) sheet.PageSetup.RightHeader = setup.rightHeader;
		if(setup.rightFooter) sheet.PageSetup.RightFooter = setup.rightFooter;
		
		if(setup.leftMargin) sheet.PageSetup.LeftMargin = this.oExcel.InchesToPoints(setup.leftMargin);
		if(setup.rightMargin) sheet.PageSetup.RightMargin = this.oExcel.InchesToPoints(setup.rightMargin);
		if(setup.topMargin) sheet.PageSetup.TopMargin = this.oExcel.InchesToPoints(setup.topMargin);
		if(setup.bottomMargin) sheet.PageSetup.BottomMargin = this.oExcel.InchesToPoints(setup.bottomMargin);
		if(setup.headerMargin) sheet.PageSetup.HeaderMargin = this.oExcel.InchesToPoints(setup.headerMargin);
		if(setup.footerMargin) sheet.PageSetup.FooterMargin = this.oExcel.InchesToPoints(setup.footerMargin);
		
		
		if(setup.hasOwnProperty('fitToPagesWide')) {
			sheet.PageSetup.Zoom = false;
			sheet.PageSetup.FitToPagesWide = setup.fitToPagesWide;
		}
		if(setup.hasOwnProperty('fitToPagesTall')) {
			sheet.PageSetup.Zoom = false;
			sheet.PageSetup.FitToPagesTall = setup.fitToPagesTall;
		}

		if(setup.titleRows) sheet.PageSetup.PrintTitleRows = "$1:$"+setup.titleRows;
		sheet.PageSetup.CenterHorizontally = setup.center ? true : false;
		sheet.PageSetup.PrintGridlines = setup.grid ? true : false;
	},
	
	savePDF: function(filename) {
		// type, filename, quality, include doc props, ignore print area
		this.oExcel.ActiveWorkbook.ActiveSheet.ExportAsFixedFormat( Type=this.oExcel.xlTypePDF, Filename=filename, Quality=1 );
	},
	
	toFormat: function(cols, format) {
		if(cols == null) return;
		
		var clist = cols.split('|');
		for(var i = 0; i < clist.length; i++) {
			if(clist[i].test(/^[0-9]+$/)) this.oExcel.ActiveWorkbook.ActiveSheet.Rows(clist[i]+":"+clist[i]).NumberFormat = format;
			else this.oExcel.ActiveWorkbook.ActiveSheet.Columns(clist[i]+":"+clist[i]).NumberFormat = format;
		}
		
		this.deselect();
	},
	
	toFormatCells: function(rows, cols, format) {
		if(cols == null || rows == null) return;
		var rlist = rows.split('|');
		var clist = cols.split('|');
		for(var i = 0; i < rlist.length; i++) {
			if(!rlist[i].test(/^[0-9]+$/)) continue;  
			for(var k = 0; k < clist.length; k++) {				
				this.oExcel.ActiveWorkbook.ActiveSheet.Cells(rlist[i],parseInt(clist[k])).NumberFormat = format;   
			}
		}		
		this.deselect();
	},

	print: function() {
		this.oExcel.ActiveWorkbook.ActiveSheet.PrintOut();
	},
	
	// DEPRECATED - Use pageSetup() and print() instead.
	printForm: function() {
		this.oExcel.ActiveWorkbook.ActiveSheet.PageSetup.PrintTitleRows = "$1:$1";
		this.oExcel.ActiveWorkbook.ActiveSheet.PageSetup.PrintGridlines = true;
		this.oExcel.ActiveWorkbook.ActiveSheet.PageSetup.Orientation = this.xlPortrait;
		this.oExcel.ActiveWorkbook.ActiveSheet.PageSetup.CenterHorizontally = true;
		
		this.oExcel.ActiveWorkbook.ActiveSheet.PageSetup.LeftMargin = this.oExcel.Application.InchesToPoints(0.25);
		this.oExcel.ActiveWorkbook.ActiveSheet.PageSetup.RightMargin = this.oExcel.Application.InchesToPoints(0.25);
		this.oExcel.ActiveWorkbook.ActiveSheet.PageSetup.TopMargin = this.oExcel.Application.InchesToPoints(0.25);
		this.oExcel.ActiveWorkbook.ActiveSheet.PageSetup.BottomMargin = this.oExcel.Application.InchesToPoints(0.25);
		
		this.oExcel.ActiveWorkbook.ActiveSheet.PrintOut();
	},
	
	// DEPRECATED - Use pageSetup() and print() instead.
	printit: function() {
		this.oExcel.ActiveWorkbook.ActiveSheet.PageSetup.PrintGridlines = true;
		this.oExcel.ActiveWorkbook.ActiveSheet.PageSetup.Orientation = this.xlLandscape;
		this.oExcel.ActiveWorkbook.ActiveSheet.PageSetup.LeftMargin = 0.25;
		this.oExcel.ActiveWorkbook.ActiveSheet.PageSetup.RightMargin = 0.25;
		this.oExcel.ActiveWorkbook.ActiveSheet.PrintOut();
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
	
	setColumnStyle: function(cols, style) {
		if(cols == null) return;
		
		var clist = cols.split(',');
		for(var i = 0; i < clist.length; i++)
			this.oExcel.ActiveWorkbook.ActiveSheet.Columns(clist[i]+":"+clist[i]).Style = style;
		
	},
	
	setRowStyle: function(rows, style) {
		if(rows == null) return;
		
		var rlist = rows.split(',');
		for(var i = 0; i < rlist.length; i++)
			this.oExcel.ActiveWorkbook.ActiveSheet.Rows(rlist[i]+":"+rlist[i]).Style = style;
		
	},

	toStyle: function(cols, style) {
		if(cols == null) return;
		
		var clist = cols.split(',');
		for(var i = 0; i < clist.length; i++)
			this.oExcel.ActiveWorkbook.ActiveSheet.Columns(clist[i]+":"+clist[i]).Style = style;
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
	},
	
	colBoldValues: function(cols) {
		if(cols == null) return;
		
		var clist = cols.split(',');
		for(var i = 0; i < clist.length; i++) {
			var fc = this.oExcel.ActiveWorkbook.ActiveSheet.Columns(clist[i]+":"+clist[i]).FormatConditions;
			fc.Add(this.xlCellValue, this.xlGreater, "=1");
			fc(fc.Count).SetFirstPriority();
			fc(1).Font.Bold = true;
			fc(1).Font.Italic = false;
			fc(1).Font.TintAndShade = 0;
			fc(1).StopIfTrue = false;
		}
	},
	
	// for a specific cell, do a comparison check on each value & if true, highlight the entire row
	//   note:  color must be an integer 
	cellHighlight: function(rowNum, colNum, color, hlight, tableName, incr, cnt) { 
		if (color == null || !Validator.isNumeric(color)) color = 6; 
		if(colNum == null || rowNum == null) return;
			
		if (hlight == 'borderbold') {
			this.oExcel.ActiveWorkbook.ActiveSheet.Cells(rowNum, colNum).Font.ColorIndex = color;
//			this.oExcel.ActiveWorkbook.ActiveSheet.Cells(rowNum, colNum).Font.Bold = true;
			this.oExcel.ActiveWorkbook.ActiveSheet.Cells(rowNum, colNum).Borders.ColorIndex = color;
			this.oExcel.ActiveWorkbook.ActiveSheet.Cells(rowNum, colNum).Borders.Weight = 4; 
		}
		else if (hlight == 'fontcolor') {
			this.oExcel.ActiveWorkbook.ActiveSheet.Cells(rowNum, colNum).Font.ColorIndex = color;
		}
		else {
			this.oExcel.ActiveWorkbook.ActiveSheet.Cells(rowNum, colNum).Interior.ColorIndex = color;
		}
		
		if (incr == null || cnt == null) return;  
		for (var j = 1; j <= cnt; j++) {
			this.oExcel.ActiveWorkbook.ActiveSheet.Cells(rowNum + (j*incr), colNum).Interior.ColorIndex = color;
		}
		
	}, 

	// for a specific column Name, retrieve the number of that column 
	getColNum: function(colName, tableName) {	
		if(colName == null) return -1;
		var colNum = -1; 
		//WScript.StdOut.WriteLine('colName = ' + colName);
		//WScript.StdOut.WriteLine('tot Cols = ' + this.oExcel.ActiveWorkbook.ActiveSheet.ListObjects(tableName?tableName:"Report").ListColumns.count); 
		for(var w = 1; w < this.oExcel.ActiveWorkbook.ActiveSheet.ListObjects(tableName?tableName:"Report").ListColumns.count; w++) {
			if (this.oExcel.ActiveWorkbook.ActiveSheet.ListObjects(tableName?tableName:"Report").ListColumns.Item(w) == colName)   {
				colNum = w; 
			}
		}
		return colNum; 		
	},
	
	numRows: function(tableName) {
		return this.oExcel.ActiveWorkbook.ActiveSheet.ListObjects(tableName?tableName:"Report").ListRows.count; 
	}, 
	
	sumCol: function(colName,tableName) { 
		var colNum = -1; 
		
		var colNum = this.getColNum(colName,tableName?tableName:"Report");  
		if (colNum < 0) return 0;
		
		var tot = 0;  
		for(var i = 2; i < this.oExcel.ActiveWorkbook.ActiveSheet.ListObjects(tableName?tableName:"Report").ListRows.count + 2; i++) {
			
			if (Validator.isNumeric(this.oExcel.ActiveWorkbook.ActiveSheet.Cells(i, colNum).value))   {
				tot = tot + this.oExcel.ActiveWorkbook.ActiveSheet.Cells(i, colNum).value; 
			}
		}
		return tot; 	
	}, 
	
	// for a specific column, do a comparison check on each value & if true, highlight the entire row (or the cell itself) 
	//   note:  val can be an integer or a string;  type will be 'gte' [for >=], 'lte' [for <=], or 'equal'   
	//   note2:  feat_type refers to what will be highlighted (possible values are 'row' and 'cell')  
	//   note3:  valColor & bkColor both refer to Excel Color Index values;  default for bkColor is null (no background color)  
//	colCondFeatureData: function(colName, type, val, feat_type, tableName, valColor, flgBold, bkColor, borderColor) {
	colCondFeatureData: function(dat) {		
		
		if (dat.type == null) dat.type = 'equal';
		if (dat.type != 'equal' && dat.type != 'gte' && dat.type != 'lte' && dat.type != 'all') return; 
		if (dat.feat_type == null) dat.feat_type = 'row';   
		
		if(dat.colName == null) return;
		if(dat.val == null) dat.val = 0; 
		if(dat.valColor == null) dat.valColor = 5;  	// default of Blue
		if(dat.flgBold == null) dat.flgBold = true;  	// default of Bold
		
		var colNum = -1; 
		
		for(var w = 1; w < this.oExcel.ActiveWorkbook.ActiveSheet.ListObjects(dat.tableName?dat.tableName:"Report").ListColumns.count; w++) {
			if (this.oExcel.ActiveWorkbook.ActiveSheet.ListObjects(dat.tableName?dat.tableName:"Report").ListColumns.Item(w) == dat.colName)   {
				colNum = w; 
			}
		}
		if (colNum < 0) return; 		
		
		// begins in row 2 to exclude the Header record 
		for(var i = 2; i < this.oExcel.ActiveWorkbook.ActiveSheet.ListObjects(dat.tableName?dat.tableName:"Report").ListRows.count + 2; i++) {
			if ((!Validator.isNumeric(dat.val) || (Validator.isNumeric(dat.val) &&  Validator.isNumeric(this.oExcel.ActiveWorkbook.ActiveSheet.Cells(i, colNum).value))) && 
						(  (dat.type == 'gte' && this.oExcel.ActiveWorkbook.ActiveSheet.Cells(i, colNum).value >= dat.val)   // highlights all values >= min value
						|| (dat.type == 'lte' && this.oExcel.ActiveWorkbook.ActiveSheet.Cells(i, colNum).value <= dat.val)   // highlights all values <= max value
						|| (dat.type == 'equal' && this.oExcel.ActiveWorkbook.ActiveSheet.Cells(i, colNum).value == dat.val) 
						|| (dat.type == 'all')  ) ) {
				if (dat.feat_type == 'row')  {
					this.oExcel.ActiveWorkbook.ActiveSheet.Rows(i).Font.ColorIndex = dat.valColor; 
					this.oExcel.ActiveWorkbook.ActiveSheet.Rows(i).Font.Bold = dat.flgBold; 
					if (dat.bkColor) this.oExcel.ActiveWorkbook.ActiveSheet.Rows(i).Interior.ColorIndex = dat.bkColor;
				}
				else  { 
					this.oExcel.ActiveWorkbook.ActiveSheet.Cells(i, colNum).Font.ColorIndex = dat.valColor;
					this.oExcel.ActiveWorkbook.ActiveSheet.Cells(i, colNum).Font.Bold = dat.flgBold;
					if (dat.bkColor) this.oExcel.ActiveWorkbook.ActiveSheet.Cells(i, colNum).Interior.ColorIndex = dat.bkColor;
					if (dat.borderColor) { 
						if (dat.borderLeft)  { 
							this.oExcel.ActiveWorkbook.ActiveSheet.Cells(i, colNum).Borders(this.xlEdgeLeft).ColorIndex = dat.borderColor;  // 7 corresponds to Left border;  10 for Rt;  8 for Top;  9 for Bottom
							this.oExcel.ActiveWorkbook.ActiveSheet.Cells(i, colNum).Borders(this.xlEdgeLeft).Weight = (dat.borderWeight) ? dat.borderWeight : 3; 
						}
						else {
							this.oExcel.ActiveWorkbook.ActiveSheet.Cells(i, colNum).Borders.ColorIndex = dat.borderColor;
							this.oExcel.ActiveWorkbook.ActiveSheet.Cells(i, colNum).Borders.Weight = (dat.borderWeight) ? dat.borderWeight : 3; 
						}
					}
				}
			}
		}
	},	

	addTopHeader: function() {
		this.oExcel.ActiveWorkbook.ActiveSheet.Rows("1:1").Select();
		this.oExcel.Selection.Insert; // Shift:=this.xlDown, CopyOrigin:=this.xlFormatFromLeftOrAbove; 
	}, 
	
	mergeCells: function(dat) {
		if(dat.range == null) return;
//		this.oExcel.ActiveWorkbook.ActiveSheet.Range(dat.range).Select();
		if (dat.bkColor) this.oExcel.ActiveWorkbook.ActiveSheet.Range(dat.range).Font.ColorIndex = dat.valColor;
		if (dat.flgBold) this.oExcel.ActiveWorkbook.ActiveSheet.Range(dat.range).Font.Bold = dat.flgBold;
		if (dat.bkColor) this.oExcel.ActiveWorkbook.ActiveSheet.Range(dat.range).Interior.ColorIndex = dat.bkColor;
		var cells = dat.range.split(':');
		if (dat.title) this.oExcel.ActiveWorkbook.ActiveSheet.Range(cells[0]).value = dat.title; 
	}, 
	
	/* freeze the spreadsheet based on a specific cell (everything above and to the left of this cell will be froze */
	freezeCell: function(cellNum) {
//		this.oExcel.ActiveWorkbook.ActiveSheet.Cells(rowNum, colNum)
		this.oExcel.ActiveWorkbook.ActiveSheet.Range(cellNum).Select();
//		this.oExcel.ActiveWorkbook.ActiveSheet.Range("A2").Select();
		this.oExcel.ActiveWindow.FreezePanes = false;
		this.oExcel.ActiveWindow.FreezePanes = true;
	}, 
	
	hideColumns: function(cols) {
		if(cols == null) return;
		
		var clist = cols.split(',');
		for(var i = 0; i < clist.length; i++)
			this.oExcel.ActiveWorkbook.ActiveSheet.Columns(clist[i]).EntireColumn.Hidden = true;
	},
	
	getColumnLetter: function(n) {
		var colLetter = '';
		
		n++;
		while(n > 0) {
			n--;
			colLetter = String.fromCharCode(65 + (n%26)) + colLetter;
			n = Math.floor(n / 26);
		}
		
		return colLetter;
	},

	nameColumns: function(names) {
		if(names == null) return;
		
		var clist = names.split(',');
		for(var i = 0; i < clist.length; i++) {
			var colLetter = String.fromCharCode(65 + (i%26));
			if(i >= 26) colLetter = String.fromCharCode(65 + ((i - (i%26)) % 26)) + colLetter;
			this.oExcel.ActiveWorkbook.ActiveSheet.Range(colLetter+"1").FormulaR1C1 = clist[i];
		}
	},

	showTotals: function() {
		this.oExcel.ActiveWorkbook.ActiveSheet.ListObjects("Report").ShowTotals = true;
	},

	totalSum: function(colNames, rptnam, highlight) {
		if(colNames == null) return;
		if(rptnam == null) rptnam = "Report"; 
		this.showTotals(rptnam);
		
		var hlist = [];  // array of Headers to be highlighted in Totals row;  should be a subset of clist array
		if (highlight != null) hlist=highlight.split(','); 
		
		var clist = colNames.split(',');
		for(var i = 0; i < clist.length; i++) {
			this.oExcel.ActiveWorkbook.ActiveSheet.ListObjects(rptnam).ListColumns(clist[i]).TotalsCalculation = this.xlTotalsCalculationSum;
			// highlight row logic -- if a Column in the Totals Row is to be highlighted, the Highlight Name must match the Header value  (e.g. ‘LPI Accrual’ = ‘LPI Accrual’) 
			if (hlist.indexOf(clist[i]) > -1) { 
				for(var w = 1; w <= this.oExcel.ActiveWorkbook.ActiveSheet.ListObjects(rptnam).ListColumns.count; w++) {
					if (this.oExcel.ActiveWorkbook.ActiveSheet.ListObjects(rptnam).ListColumns.Item(w) == clist[i])   {
						this.oExcel.ActiveWorkbook.ActiveSheet.Cells(this.oExcel.ActiveWorkbook.ActiveSheet.ListObjects(rptnam).ListRows.count + 2, w).Font.ColorIndex = 5;
					}
				}
			}
		}
	},

	totalAvg: function(colNames, prec, rptnam) {
		if(colNames == null) return;
		if(rptnam == null) rptnam = "Report"; 
		if (prec == null) prec = -1;   
		this.showTotals(rptnam);
		
		var clist = colNames.split(',');
		for(var i = 0; i < clist.length; i++)
			this.oExcel.ActiveWorkbook.ActiveSheet.ListObjects(rptnam).ListColumns(clist[i]).TotalsCalculation = this.xlTotalsCalculationAverage;
	},
	
	hideCols: function(colNames) {
		if(colNames == null) return;
		
		var clist = colNames.split(',');
		for(var i = 0; i < clist.length; i++)
			this.oExcel.ActiveWorkbook.ActiveSheet.ListObjects("Report").ListColumns(clist[i]).Visible = true;
	},
	
	addSheet: function() {
		if(!this.oExcel.ActiveWorkbook) this.oExcel.Workbooks.Add();
		this.oExcel.ActiveWorkbook.Sheets.Add();
	},
	
	nameSheet: function(name) {
		if(!this.oExcel.ActiveWorkbook) this.oExcel.Workbooks.Add();
		this.oExcel.ActiveWorkbook.ActiveSheet.Name = name;
	},

	saveAs: function(toFile) {
		this.oExcel.ActiveWorkbook.SaveAs(Filename = toFile, FileFormat = this.xlWorkbookNormal);
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
