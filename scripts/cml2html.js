var raw2item=require('./cml2item')
var item2package2=require('./item2package2')
var package2html=require('./package2html')
var fs=require('fs')

var rawxml = fs.readFileSync(process.argv[2], "utf-8")
//var data = raw2item(rawxml)
var xmlfile = process.argv[2].substr(0, process.argv[2].lastIndexOf('.')) + ".xml"
var zipfile=process.argv[2].substr(0, process.argv[2].lastIndexOf('.')) + ".zip"
var promise=raw2item(rawxml)
promise.then(xml=>{
  //console.log("xml=\n",xml)
  fs.writeFileSync(xmlfile, xml, "utf-8")
  return item2package2(xmlfile)
})
.then(()=>{package2html(zipfile)})
//fs.writeFileSync(xmlfile, data, "utf-8")
//item2package(xmlfile)
//console.log("Done")