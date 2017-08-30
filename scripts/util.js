var raw2item=require('./raw2item')
var item2package=require('./item2package')
var package2html=require('./package2html')
var fs=require('fs')

var rawxml = fs.readFileSync(process.argv[2], "utf-8")
var data = raw2item(rawxml)
var xmlfile = process.argv[2].substr(0, process.argv[2].lastIndexOf('.')) + ".xml"
fs.writeFileSync(xmlfile, data, "utf-8")
item2package(xmlfile)
console.log("Done")