// node scripts\testpackages2html.js sat2_chi_2016_01.zip sat2_mathb_2016_A.zip sat2_chm_2016_14.zip
var fs = require('fs');
var package2json=require('./package2json')
var jsons2html=require('./jsons2html')
var jsons=[]
var packageCount=process.argv.length-2
for (var i=0;i<packageCount;i++){
  jsons.push(package2json(process.argv[2+i]))
}
var html=jsons2html(jsons)
fs.writeFileSync("test.html", html, "utf-8")