
/**
* some utils
*/

var uniq = function(arr) {
  var i, len=arr.length, out=[], obj={};
  for (i=0;i<len;i++) { obj[arr[i]]=0; }
  for (i in obj) { out.push(i); }
  return out;
}

var trim = function(s) {
	return s.replace(/^(\s*)((\S+\s*?)*)(\s*)$/,"$2");
}

/* -----[ Exports ]----- */
exports.uniq = uniq;
exports.trim = trim;