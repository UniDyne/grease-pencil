
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

var Sequel = new Class({
	Extends: DataSource,
	
	initialize: function(options) {
		this.parent(options);
	},
	
	getConnectionString: function() {
		return "Driver={SQL Server};Server="+this.options.server+";Database="+this.options.db+";UID="+this.options.uid+";PWD="+this.options.pwd;
	}
});

