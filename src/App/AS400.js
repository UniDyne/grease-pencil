var AS400 = (function() {
	WScript.StdOut.WriteLine("AS400 Utility Loaded");
	
	// This version is to work with the Java iAccess program
	// This is expected to be in BaseDir + bin\IBMiAccess_v1r1
	// iAccess requires a JRE... use bundled JDK at bin\openjdk
	
	var java = Config.BaseDir + "bin\\openjdk\\bin\\java.exe";
	var iAccess = Config.BaseDir + "bin\\IBMiAccess_v1r1\\acsbundle.jar";
	var cmdLine = '"'+java+'" -jar "'+iAccess+'" ';
	
	return {
	call: function(prgName, paramList) {
		//if(paramList) Foundation.Shell.Run('"'+Config.AS400.client+'RMTCMD.exe" //'+Config.AS400.host+" CALL PGM("+prgName+") PARM("+parmList+")",7,true);
		//else Foundation.Shell.Run('"'+Config.AS400.client+'RMTCMD.exe" //'+Config.AS400.host+" CALL PGM("+prgName+")",7,true);
		var exec = cmdLine + '/plugin=rmtcmd /userid='+Config.AS400.usr + ' /system='+Config.AS400.host + ' /cmd="CALL PGM('+prgName+')' + (paramList ? ' PARM('+paramList+')' : '') + '"';
		Foundation.Shell.Run(exec, 7, true);
	},
	
	cmd: function(cmdName) {
		//var oExec = Foundation.Shell.Exec('"'+Config.AS400.client+'RMTCMD.exe" //'+Config.AS400.host+" "+cmdName);
		var oExec = Foundation.Shell.Exec(cmdLine + '/plugin=rmtcmd /userid='+Config.AS400.usr + ' /system='+Config.AS400.host + ' /cmd="'+cmdName+'"');
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
	
	get: function(dtfName) {
		//var oExec = Foundation.Shell.Exec('"'+Config.AS400.client+'RTOPCB.exe" '+dtfName);
		var oExec = Foundation.Shell.Exec(cmdLine + '/userid='+Config.AS400.usr+' /plugin=download '+dtfName);
		var output = "";
		while(oExec.Status == 0) {
			if(!oExec.StdOut.AtEndOfStream) {
				output += oExec.StdOut.ReadAll();
			}
			WScript.Sleep(100);
		}
		output += oExec.StdOut.ReadAll();
		if(output.lastIndexOf('successful') < 0) return false;
		return true;
	},
	
	put: function(dttName) {
		//var cmdLine = '"'+Config.AS400.client+'RXFERPCB.exe" "'+dttName+'" '+Config.AS400.usr+' '+Config.AS400.pwd;
		var cmdLine = cmdLine + '/userid='+Config.AS400.usr + ' /plugin=upload ' + dttName;
		
		var oExec = Foundation.Shell.Exec(cmdLine);
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
		//var oExec = Foundation.Shell.Exec('"'+Config.AS400.client+'RMTCMD.exe" //'+Config.AS400.host+" SBMJOB CMD("+cmdName+") JOB("+jobName+") JOBD("+jobDir+") USER("+user+") MSGQ("+msgq+")");
		var oExec = Foundation.Shell.Exec(cmdLine + '/plugin=rmtcmd /userid='+Config.AS400.usr + ' /system='+Config.AS400.host + ' /cmd="SBMJOB CMD('+cmdName+') JOB('+jobName+') JOBD('+jobDir+') USER('+user+') MSGQ('+msgq+')"');//'"'+Config.AS400.client+'RMTCMD.exe" //'+Config.AS400.host+" SBMJOB CMD("+cmdName+") JOB("+jobName+") JOBD("+jobDir+") USER("+user+") MSGQ("+msgq+")");
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
