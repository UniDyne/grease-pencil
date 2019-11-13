// Progress 4GL

GreasePencil.Reporting.fetch4GL = function(id) {
    // extract the .p file to a temp directory
    var outFile = Foundation.Fso.OpenTextFile(Foundation.Fso.GetSpecialFolder(2)+'\\'+id+".p", 2, true, 0);
    outFile.WriteLine(Foundation.Resources.getText(id,"p4gl"));
    outFile.Close();
    
    var p4gl = new Progress(Foundation.Fso.GetSpecialFolder(2)+'\\'+id+".p");
    //p4gl.setDatabase("LIVE");
    //p4gl.setParam(Foundation.Fso.GetSpecialFolder(2));
    //p4gl.exec();
    
    return p4gl;
};


Progress = function(procName, param) {
    // hard coded to bin for now - add config options and search path
    this.dlc = Config.BaseDir + "bin\\progress";

    // required environment variables
    var env = Foundation.Shell.Environment("PROCESS");
	env("DLC") = this.dlc;
	env("PROPATH") = Config.BaseDir + "4gl";

    this.ini = Config.BaseDir + "4gl\\progress.ini";
    this.args = new Object();

    this.args.db = Config.Progress.test_db;
	this.args.ld = Config.Progress.ld;
	this.args.N = "TCP";
	this.args.H = Config.Progress.host;
	this.args.S = Config.Progress.test_port;

    this.args.p = procName;
	this.args.T = "c:\\temp"; // replace with user temp...
	this.args.mmax = 10000;
	this.args.s = 60;
	this.args.inp = 8096;
    this.args.Mm = 1024;

    this.args.param = param;

    this.args.U = Config.Progress.usr;
	this.args.P = Config.Progress.pwd;

    this.result = "";
	this.debug = true;
	this.runtime = 0;
}

Progress.prototype.testMode = function() {
	this.setDatabase("TEST");
}

Progress.prototype.setDatabase = function(dbName) {
	switch(dbName) {
		case "live":
		case "LIVE":
			this.args.db = Config.Progress.live_db;
			this.args.S = Config.Progress.live_port;
			break;
		case "test":
		case "TEST":
			this.args.db = Config.Progress.test_db;
			this.args.S = Config.Progress.test_port;
			break;
		default:
			this.args.S = dbName;
	}
}

Progress.prototype.setProc = function(procName) {
	this.args.p = procName;
}

Progress.prototype.setParam = function(param) {
	this.args.param = param;
}

Progress.prototype.setUser = function(user, pass) {
	this.args.U = user;
	this.args.P = pass;
}

Progress.prototype.exec = function(allowedTime) {
	if(!allowedTime) allowedTime = 86400; // 1800 sec = 30 min

	var cmd = '"'+this.dlc+'\\bin\\prowin32.exe" -basekey INI -ininame '+this.ini;
	
	cmd += " -db "+this.args.db;
	cmd += " -ld "+this.args.ld;
	cmd += " -N "+this.args.N;
	cmd += " -H "+this.args.H;
	cmd += " -S "+this.args.S;
	cmd += " -p "+this.args.p;
	cmd += " -T "+this.args.T;
	cmd += " -Mm "+this.args.Mm;
	cmd += " -mmax "+this.args.mmax;
	cmd += " -s "+this.args.s;
	cmd += " -inp "+this.args.inp;
	if(this.args.param != null)
		cmd += " -param \""+this.args.param+"\"";
	cmd += " -U "+this.args.U;
	cmd += " -P "+this.args.P;
	
	cmd += " -b";
		
	var runtime = new Date();
	
	var oExec = Foundation.Shell.Exec(cmd);
	var output = "";
	// do not return until finished
	
	while(oExec.Status == 0) {
		if(!oExec.StdOut.AtEndOfStream) {
			var line = oExec.StdOut.ReadAll();
//			if(this.debug) WScript.StdOut.WriteLine(Math.ceil(((new Date()) - runtime)/1000) + ": " + line);
			output += line;
		}
		WScript.Sleep(100);

		if((new Date()) - runtime > 1000 * allowedTime) {
			oExec.Terminate();
			throw { name: "4GL Error", message: "Progress 4GL time exceeded."};
		}
	}
	
	this.runtime = (new Date()) - runtime;
	
	
	this.result = output;
	if(this.debug) WScript.StdOut.WriteLine(output);
	
	
	if(oExec.ExitCode != 0) throw { name: "4GL Error", message: "Progress 4GL exited with code "+oExec.ExitCode+"." };
}

Progress.prototype.launch = function() {
	var cmd = '"'+this.dlc+'\\bin\\prowin32.exe" -basekey INI -ininame '+this.ini;
	
	cmd += " -db "+this.args.db;
	cmd += " -ld "+this.args.ld;
	cmd += " -N "+this.args.N;
	cmd += " -H "+this.args.H;
	cmd += " -S "+this.args.S;
	cmd += " -p "+this.args.p;
	cmd += " -T "+this.args.T;
	cmd += " -mmax "+this.args.mmax;
	cmd += " -s "+this.args.s;
	cmd += " -inp "+this.args.inp;
	if(this.args.param != null)
		cmd += " -param \""+this.args.param+"\"";
	cmd += " -U "+this.args.U;
	cmd += " -P "+this.args.P;
	
	//cmd += " -b";
	
	var oExec = Foundation.Shell.Run(cmd);
}

Progress.prototype.launchPF = function(pfin) {
	var cmd = this.dlc+"\\bin\\prowin32.exe -basekey INI -ininame "+this.ini+" -pf "+pfin;
	
	var oExec = Foundation.Shell.Run(cmd);
}
