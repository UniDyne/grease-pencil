GreasePencil.Net.Smtp = new Class({
	Implements: [Options],
	
	options: {
		server: null
	},
	
	initialize: function() {
		this.message = new ActiveXObject("CDO.Message");
		
		if(this.options.server == null && Object.contains(Config, 'Email'))
			this.setOptions(Config.Email);
		
		Object.each(this.options, function(value, key) {
			//WScript.StdOut.WriteLine(': '+key+' -> '+value);
			if( (''+value).startsWith('data:')) value = Encoder.decode64(value.replace('data:',''));
			this.message.Configuration.Fields.Item("http://schemas.microsoft.com/cdo/configuration/"+key) = value;
		}, this);
		this.message.Fields.Update();
	},
	
	finalize: function() {
		
	}
});
