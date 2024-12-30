GreasePencil.App.iSeries = (function() {
	WScript.StdOut.WriteLine("iSeries Utility Loaded");
	
	// This version is to work with the Java iAccess program
	// This is expected to be in BaseDir + bin\ClientSolutions
	// iAccess requires a JRE... use bundled JDK at bin\semeru8-jdk
	
	var java = Config.BaseDir + "bin\\semeru8-jdk\\bin\\java.exe";
	var iAccess = Config.BaseDir + "bin\\ClientSolutions\\acsbundle.jar";
	var cmdLine = '"'+java+'" -jar "'+iAccess+'" ';

	//WScript.StdOut.WriteLine(java);
	//WScript.StdOut.WriteLine(iAccess);
	//WScript.StdOut.WriteLine(cmdLine);
	
	return {
	call: function(prgName, paramList) {
		var exec = cmdLine + '/plugin=rmtcmd /userid='+Config.iSeries.usr + ' /system='+Config.iSeries.host + ' /cmd="CALL PGM('+prgName+')' + (paramList ? ' PARM('+paramList+')' : '') + '"';
		Foundation.Shell.Run(exec, 7, true);
	},
	
	cmd: function(cmdName) {
		var oExec = Foundation.Shell.Exec(cmdLine + '/plugin=rmtcmd /userid='+Config.iSeries.usr + ' /system='+Config.iSeries.host + ' /cmd="'+cmdName+'"');
		var output = "";
		while(oExec.Status == 0) {
			if(!oExec.StdOut.AtEndOfStream) {
				output += oExec.StdOut.ReadAll();
			}
			WScript.Sleep(100);
		}
		output += oExec.StdOut.ReadAll();
		if(output.lastIndexOf('CPC') < 0) return false;
		return true;
	},

	createDTF: function(dtfName, params) {
		// TODO: Move to templates

		var outFile = Foundation.Fso.OpenTextFile(dtfName, 2, true, 0);

		outFile.WriteLine('[DataTransferFrom]');
		outFile.WriteLine('DataTransferVersion=1.0');
		
		outFile.WriteLine('[HostInfo]');
		outFile.WriteLine('Database=*SYSBAS');
		outFile.WriteLine('HostFile=' + params.source);
		outFile.WriteLine('HostName=' + Config.iSeries.host);

		outFile.WriteLine('[ClientInfo]');
		outFile.WriteLine('OutputDevice=2');
		outFile.WriteLine('FileEncoding=UTF-8');
		outFile.WriteLine('ClientFile=' + params.outfile);

		outFile.WriteLine('[SQL]');
		outFile.WriteLine('Select='+(params.select?params.select:''));
		outFile.WriteLine('Where='+(params.where?params.where:''));
		outFile.WriteLine('JoinBy='+(params.join?params.join:''));
		outFile.WriteLine('GroupBy='+(params.group?params.group:''));
		outFile.WriteLine('Having='+(params.having?params.having:''));
		outFile.WriteLine('OrderBy='+(params.order?params.order:''));
		outFile.WriteLine('MissingFields=0');
		outFile.WriteLine('SQLSelect='+(params.sql?params.sql:''));

		outFile.WriteLine('[Properties]');
		outFile.WriteLine('Convert65535=1');
		outFile.WriteLine('StoreDecFAsChar=1');
		outFile.WriteLine('Notify=1');
		outFile.WriteLine('DisplayLongSchemaNames=1');
		outFile.WriteLine('DisplayLongTableNames=1');
		outFile.WriteLine('DisplayLongColumnNames=1');
		outFile.WriteLine('SQLStmt='+(params.sql?'1':'0'));
		outFile.WriteLine('UserOption=0');
		outFile.WriteLine('UseSSL=2');
		outFile.WriteLine('Check4Untrans=0');
		outFile.WriteLine('ShowWarnings=1');
		outFile.WriteLine('UseCompression=1');
		outFile.WriteLine('AutoRun=0');

		outFile.WriteLine('[Options]');
		outFile.WriteLine('DateFmt=MDY');
		outFile.WriteLine('DateSep=[/]');
		outFile.WriteLine('TimeFmt=HMS');
		outFile.WriteLine('TimeSep=[:]');
		outFile.WriteLine('DecimalSep=.');

		outFile.Close();
	},
	
	get: function(dtfName) {
		var cmd = cmdLine + '/userid=' + Config.iSeries.usr + ' /plugin=download ' + dtfName;
		
		var oExec = Foundation.Shell.Exec(cmd);
		var output = "";
		while(oExec.Status == 0) {
			if(!oExec.StdOut.AtEndOfStream) {
				output += oExec.StdOut.ReadAll();
			}
			WScript.Sleep(100);
		}
		output += oExec.StdOut.ReadAll();

		WScript.StdOut.WriteLine(output);
		if(output.lastIndexOf('complete') < 0) return false;
		return true;
	},
	
	put: function(dttName) {
		var cmd = cmdLine + '/userid='+Config.iSeries.usr + ' /plugin=upload ' + dttName;
		WScript.StdOut.WriteLine(cmd);
		
		var oExec = Foundation.Shell.Exec(cmd);
		var output = "";
		while(oExec.Status == 0) {
			if(!oExec.StdOut.AtEndOfStream) {
				output += oExec.StdOut.ReadAll();
			}
			WScript.Sleep(100);
		}
		output += oExec.StdOut.ReadAll();
	//	WScript.Echo (output);
	//	if(output.lastIndexOf('successful') < 0) return false;
		if(output.lastIndexOf('No') < 0) return false;
		return true;
	},
	
	sbmjob: function(cmdName, jobName, jobDir, user, msgq) {
		var oExec = Foundation.Shell.Exec(cmdLine + '/plugin=rmtcmd /userid='+Config.iSeries.usr + ' /system='+Config.iSeries.host + ' /cmd="SBMJOB CMD('+cmdName+') JOB('+jobName+') JOBD('+jobDir+') USER('+user+') MSGQ('+msgq+')"');
		var output = "";
		while(oExec.Status == 0) {
			if(!oExec.StdOut.AtEndOfStream) {
				output += oExec.StdOut.ReadAll();
			}
			WScript.Sleep(100);
		}
		output += oExec.StdOut.ReadAll();
		if(output.lastIndexOf('CPC1221') < 0) return false;
		return true;
	}
	};
	
})();

$_iSeries = GreasePencil.App.iSeries;
