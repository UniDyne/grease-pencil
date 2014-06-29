TODO
====
*29 June 2014* 

### Data Layer ###
The original data layer in Foundation 2 consisted of only two singletons. One was
for SQL Server and the other was for FoxBase. These would use the configuration
to connect to their data sources, if available. The problem was that this could
not support connections to more than one source of a given type. In GreasePencil,
I plan to change this such that these are instances rather than singletons. They
should connect to the configured data source by default if an alternate source
is not specified.

In addition, I plan to expand how the data layer functions sucn that it is
pluggable for new sources and so that it will work with the Reporting features.

### Internet Protocols ###
Basic functionality for Internet protocols (HTTP, SMTP, etc) will be added. The
original Foundation source contained this functionality via wrappers for the
ActiveX CDO and XHR objects. These are of high priority and will be ported over
soon.

### Other Applications ###
Compatibility with Progress 4GL and CrystalReports should be available sometime
in the near future. There is already functionality for Excel and Access. Reports
automation is the main reason this framework exists.

