var raw2item=require('./cml2item')
var item2package=require('./item2package')
var fs=require('fs')

var rawxml = fs.readFileSync(process.argv[2], "utf-8")
//var data = raw2item(rawxml)
var xmlfile = process.argv[2].substr(0, process.argv[2].lastIndexOf('.')) + ".xml"
var type=process.argv[3]  // pu for MathML with special treatment, mml for MathML, otherwise no MML
var promise=raw2item(rawxml,type)
promise.then(xml=>{
  //console.log("xml=\n",xml)
  fs.writeFileSync(xmlfile, xml, "utf-8")
  item2package(xmlfile)
  console.log("Done")
})
//fs.writeFileSync(xmlfile, data, "utf-8")
//item2package(xmlfile)
//console.log("Done")