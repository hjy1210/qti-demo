var fs = require('fs');
var archiver = require('archiver');

var DOMParser = require('xmldom').DOMParser
var XMLSerializer = require('xmldom').XMLSerializer
var root = `<?xml version="1.0"?>
<manifest 
  xmlns="http://www.imsglobal.org/xsd/imscp_v1p1" 
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.imsglobal.org/xsd/imscp_v1p1 http://www.imsglobal.org/xsd/qti/qtiv2p1/qtiv2p1_imscpv1p2_v1p0.xsd">
  <metadata>
    <schema>QTIv2.1 Package</schema>
    <schemaversion>1.0.0</schemaversion>
  </metadata>
  <organizations/>
  <resources>
  </resources>
</manifest>`

function test2() {
  var identifier = "sat2_chi_2016_02"
  var xmldoc = new DOMParser().parseFromString(root).documentElement
  xmldoc.setAttribute("identifier", identifier)
  var file = xmldoc.parentNode.createElement('file')
  file.setAttribute('href', identifier + ".xml")
  var resource = xmldoc.parentNode.createElement('resource')
  resource.setAttribute("identifier", identifier)
  resource.setAttribute("type", "imsqti_item_xmlv2p1")
  resource.setAttribute("href", identifier + ".xml")
  resource.appendChild(file)
  xmldoc.getElementsByTagName("resources")[0].appendChild(resource)
  info(xmldoc)
}


function test() {
  var root = `<?xml version="1.0"?>
<manifest 
  xmlns="http://www.imsglobal.org/xsd/imscp_v1p1" 
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.imsglobal.org/xsd/imscp_v1p1 http://www.imsglobal.org/xsd/qti/qtiv2p1/qtiv2p1_imscpv1p2_v1p0.xsd" identifier="MANIFEST-sat2_chi_2016_01">
  <metadata>
    <schema>QTIv2.1 Package</schema>
    <schemaversion>1.0.0</schemaversion>
  </metadata>
  <organizations/>
  <resources>
    <resource identifier="sat2_chi_2016_01" type="imsqti_item_xmlv2p1" href="sat2_chi_2016_01.xml">
      <file href="sat2_chi_2016_01.xml"/>
      <file href="styles/style.css"/>
    </resource>
  </resources>
  <!--Hello
   multiline
    comment -->
  <script>
  <![CDATA[
    funcrion double(x){
      return 2*x
    }
  ]]>
  </script>
</manifest>`

  var parser = new DOMParser()
  var document = parser.parseFromString(root, "text/xml")
  var xmldoc = document.documentElement
  console.log(xmldoc.getAttribute("identifier"))
  console.log(xmldoc.getElementsByTagName('resources').length)
  console.log(xmldoc.getElementsByTagName('file').length)
  console.log(xmldoc.getElementsByTagName('schema')[0].childNodes[0].nodeValue)
  var resources = xmldoc.getElementsByTagName('resources')
  var resource = resources[0].childNodes[0]
  var file = document.createElement('file')
  file.setAttribute('href', 'sat2_chi_2016_01.xml')
  var resource = xmldoc.getElementsByTagName('resource')[0]
  resource.appendChild(file)
  info(xmldoc)
}

function info(node, leading = "") {
  if (node.nodeName == "#text" || node.nodeName == "#cdata-section" || node.nodeName == "#comment") {
    if (node.nodeValue.trim() !== "")
      console.log(leading + node.nodeValue)
  } else {
    var str = ""
    for (var i = 0; i < node.attributes.length; i++) {
      str += " " + node.attributes[i].nodeName + '="' + node.attributes[i].nodeValue + '"'
    }
    console.log(leading + "<" + node.nodeName + str + ">")
    if (node.childNodes.length > 0) {
      for (var i = 0; i < node.childNodes.length; i++) {
        info(node.childNodes[i], leading + "  ")
      }
    }
  }
}

//test()
//test2()
///// In TAO, identifier of manifest element can not identical to that of resource element.
function item2package(xmlfile) {
  var identifier = xmlfile.substr(0, xmlfile.lastIndexOf("."))
  var xmlstr = fs.readFileSync(xmlfile, 'utf-8')
  //console.log(xmlstr)
  var imsdoc = new DOMParser().parseFromString(root).documentElement
  imsdoc.setAttribute("identifier", "manifest_" + identifier)
  var xmldoc = new DOMParser().parseFromString(xmlstr).documentElement
  var stylesheets = xmldoc.getElementsByTagName('stylesheet')
  var images = xmldoc.getElementsByTagName('img')
  var resource = imsdoc.parentNode.createElement('resource')
  resource.setAttribute("identifier", identifier)
  resource.setAttribute("type", "imsqti_item_xmlv2p1")
  resource.setAttribute("href", xmlfile)
  imsdoc.getElementsByTagName('resources')[0].appendChild(resource)
  var file = imsdoc.parentNode.createElement('file')
  file.setAttribute('href', xmlfile)
  resource.appendChild(file)
  for (var i = 0; i < images.length; i++) {
    file = imsdoc.parentNode.createElement('file')
    file.setAttribute('href', images[i].getAttribute('src'))
    resource.appendChild(file)
  }
  for (var i = 0; i < stylesheets.length; i++) {
    file = imsdoc.parentNode.createElement('file')
    file.setAttribute('href', stylesheets[i].getAttribute('href'))
    resource.appendChild(file)
  }
  var imsmanifest=new XMLSerializer().serializeToString(imsdoc)
  // fs.writeFileSync("imsmanifest.xml",imsmanifest , "utf-8")

  var output = fs.createWriteStream(identifier+'.zip');
  var archive = archiver('zip', {
    zlib: { level: 9 } // Sets the compression level.
  });

  // listen for all archive data to be written
  output.on('close', function () {
    console.log(archive.pointer() + ' total bytes');
    console.log('archiver has been finalized and the output file descriptor has closed.');
  });

  // good practice to catch warnings (ie stat failures and other non-blocking errors)
  archive.on('warning', function (err) {
    if (err.code === 'ENOENT') {
      // log warning
    } else {
      // throw error
      throw err;
    }
  });

  // good practice to catch this error explicitly
  archive.on('error', function (err) {
    throw err;
  });

  // pipe archive data to the file
  archive.pipe(output);

  var files = [xmlfile]
  for (var i=0;i<images.length;i++) {
    files.push(images[i].getAttribute('src'))
  }
  for (var i=0;i<stylesheets.length;i++) {
    files.push(stylesheets[i].getAttribute('href'))
  }

  console.log(files)
  archive.append(imsmanifest,{name:"imsmanifest.xml"})
  for (var i = 0; i < files.length; i++) {
    archive.append(fs.createReadStream(files[i]), { name: files[i] });
  }
  // finalize the archive (ie we are done appending files but streams have to finish yet)
  archive.finalize();
}

item2package("sat2_chi_2016_01.xml")