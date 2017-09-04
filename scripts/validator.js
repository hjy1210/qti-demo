var xsd = require('libxml-xsd');
var fs = require('fs')
///// can not validate item.xml file against imsqti_v2p1.xsd
var schemaPath = process.argv[2]
xsd.parseFile(schemaPath, function (err, schema) {
  var documentString = fs.readFileSync(process.argv[3], "utf-8")
  schema.validate(documentString, function (err, validationErrors) {
    if (err) throw err
    console.log("errors:", validationErrors)
  });
});