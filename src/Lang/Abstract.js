/**
* For generating abstract classes and singletons.
**/

var Abstract = function(obj){
	obj = obj || {};
	obj.extend = $_extend.overloadSetter();
	return obj;
};
