///// node cml2json.js cmlfile [pu|mml]
var cml2item=require('./cml2item')
var item2package=require('./item2package')
var package2json=require('./package2json')
var fs=require('fs')

var cmlxml = fs.readFileSync(process.argv[2], "utf-8")
//var data = cml2item(cmlxml)
var xmlfile = process.argv[2].substr(0, process.argv[2].lastIndexOf('.')) + ".xml"
var zipfile = process.argv[2].substr(0, process.argv[2].lastIndexOf('.')) + ".zip"
var jsonfile=process.argv[2].substr(0, process.argv[2].lastIndexOf('.')) + ".json"
var type
if (process.argv[3]) 
  type=process.argv[3] // pu for MathML with special treatment, mml for MathML, otherwise no MML
else
  type="pu"
var promise=cml2item(cmlxml,type)
promise
  .then(xml=>{
  //console.log("xml=\n",xml)
  fs.writeFileSync(xmlfile, xml, "utf-8")
  return item2package(xmlfile)
  })
  .then(()=>{
    var json=package2json(zipfile)
    fs.writeFileSync(jsonfile,JSON.stringify(json,null,2),"utf-8")
    console.log("done")
  })
//fs.writeFileSync(xmlfile, data, "utf-8")
//item2package(xmlfile)
//console.log("Done")