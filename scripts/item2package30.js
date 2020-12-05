///// Promise version
var fs = require('fs');
var archiver = require('archiver');
var AdmZip = require('adm-zip');

var DOMParser = require('xmldom').DOMParser
var XMLSerializer = require('xmldom').XMLSerializer
var root = `<?xml version="1.0" encoding="UTF-8"?>
<manifest xmlns="http://www.imsglobal.org/xsd/qti/qtiv3p0/imscp_v1p1" 
          xmlns:imsmd="http://ltsc.ieee.org/xsd/LOM" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
          xmlns:imsqti="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" 
          xsi:schemaLocation="http://www.imsglobal.org/xsd/imsqtiasi_v3p0 
        https://purl.imsglobal.org/spec/qti/v3p0/schema/xsd/imsqti_asiv3p0_v1p0.xsd 
        http://ltsc.ieee.org/xsd/LOM 
        https://purl.imsglobal.org/spec/md/v1p3/schema/xsd/imsmd_loose_v1p3p2.xsd 
        http://www.imsglobal.org/xsd/qti/qtiv3p0/imscp_v1p1 
        https://purl.imsglobal.org/spec/qti/v3p0/schema/xsd/imsqtiv3p0_imscpv1p2_v1p0.xsd">
    <metadata>
        <schema>QTI Package</schema>
        <schemaversion>3.0.0</schemaversion>
    </metadata>
    <organizations/>
    <resources>
    </resources>
</manifest>`

///// In TAO, identifier of manifest element can not identical to that of resource element.
module.exports = function item2package(xmlfile) {
  //console.log(argv)
  //return
  let fn=require('path').parse(xmlfile).base
  var identifier = xmlfile.substr(0, fn.lastIndexOf("."))
  var xmlstr = fs.readFileSync(xmlfile, 'utf-8')
  //console.log(xmlstr)
  var imsdoc = new DOMParser().parseFromString(root).documentElement
  imsdoc.setAttribute("identifier", "manifest_" + identifier)
  var xmldoc = new DOMParser().parseFromString(xmlstr).documentElement
  var stylesheets = xmldoc.getElementsByTagName('qti-stylesheet')
  var images = xmldoc.getElementsByTagName('img')
  var audios = xmldoc.getElementsByTagName('audio')
  var objects = xmldoc.getElementsByTagName('object')
  var resource = imsdoc.parentNode.createElement('resource')
  resource.setAttribute("identifier", identifier)
  resource.setAttribute("type", "imsqti_item_xmlv3p0")
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
  for (var i = 0; i < audios.length; i++) {
    file = imsdoc.parentNode.createElement('file')
    file.setAttribute('href', audios[i].getAttribute('src'))
    resource.appendChild(file)
  }
  for (var i = 0; i < objects.length; i++) {
    file = imsdoc.parentNode.createElement('file')
    file.setAttribute('href', objects[i].getAttribute('data'))
    resource.appendChild(file)
  }
  for (var i = 0; i < stylesheets.length; i++) {
    file = imsdoc.parentNode.createElement('file')
    file.setAttribute('href', stylesheets[i].getAttribute('href'))
    resource.appendChild(file)
  }
  var imsmanifest = new XMLSerializer().serializeToString(imsdoc)
  // fs.writeFileSync("imsmanifest.xml",imsmanifest , "utf-8")

  var promise = new Promise((receive, reject) => {

    var output = fs.createWriteStream(identifier + '.zip');
    var archive = archiver('zip', {
      zlib: { level: 9 } // Sets the compression level.
    });

    // listen for all archive data to be written
    output.on('close', function () {
      console.log(archive.pointer() + ' total bytes');
      console.log('archiver has been finalized and the output file descriptor has closed.');
      receive()
    });

    // good practice to catch warnings (ie stat failures and other non-blocking errors)
    archive.on('warning', function (err) {
      if (err.code === 'ENOENT') {
        // log warning
      } else {
        // throw error
        reject(err);
      }
    });

    // good practice to catch this error explicitly
    archive.on('error', function (err) {
      reject(err);
    });

    // pipe archive data to the file
    archive.pipe(output);

    var files = [xmlfile]
    for (var i = 0; i < images.length; i++) {
      files.push(images[i].getAttribute('src'))
    }
    for (var i = 0; i < audios.length; i++) {
      files.push(audios[i].getAttribute('src'))
    }
    for (var i = 0; i < objects.length; i++) {
      files.push(objects[i].getAttribute('data'))
    }
    for (var i = 0; i < stylesheets.length; i++) {
      files.push(stylesheets[i].getAttribute('href'))
    }

    //console.log(files)
    archive.append(imsmanifest, { name: "imsmanifest.xml" })
    for (var i = 0; i < files.length; i++) {
      archive.append(fs.createReadStream(files[i]), { name: files[i] });
    }
    // finalize the archive (ie we are done appending files but streams have to finish yet)
    archive.finalize();
    
  })
  return promise
}
function item2packageAdmZip(xmlfile) {
  //console.log(argv)
  //return
  var identifier = xmlfile.substr(0, xmlfile.lastIndexOf("."))
  var xmlstr = fs.readFileSync(xmlfile, 'utf-8')
  //console.log(xmlstr)
  var imsdoc = new DOMParser().parseFromString(root).documentElement
  imsdoc.setAttribute("identifier", "manifest_" + identifier)
  var xmldoc = new DOMParser().parseFromString(xmlstr).documentElement
  var stylesheets = xmldoc.getElementsByTagName('stylesheet')
  var images = xmldoc.getElementsByTagName('img')
  var audios = xmldoc.getElementsByTagName('audio')
  var objects = xmldoc.getElementsByTagName('object')
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
  for (var i = 0; i < audios.length; i++) {
    file = imsdoc.parentNode.createElement('file')
    file.setAttribute('href', audios[i].getAttribute('src'))
    resource.appendChild(file)
  }
  for (var i = 0; i < objects.length; i++) {
    file = imsdoc.parentNode.createElement('file')
    file.setAttribute('href', objects[i].getAttribute('data'))
    resource.appendChild(file)
  }
  for (var i = 0; i < stylesheets.length; i++) {
    file = imsdoc.parentNode.createElement('file')
    file.setAttribute('href', stylesheets[i].getAttribute('href'))
    resource.appendChild(file)
  }
  var imsmanifest = new XMLSerializer().serializeToString(imsdoc)
  // fs.writeFileSync("imsmanifest.xml",imsmanifest , "utf-8")


  var files = [xmlfile]
  for (var i = 0; i < images.length; i++) {
    files.push(images[i].getAttribute('src'))
  }
  for (var i = 0; i < audios.length; i++) {
    files.push(audios[i].getAttribute('src'))
  }
  for (var i = 0; i < objects.length; i++) {
    files.push(objects[i].getAttribute('data'))
  }
  for (var i = 0; i < stylesheets.length; i++) {
    files.push(stylesheets[i].getAttribute('href'))
  }

  //console.log(files)
  var zip = new AdmZip();
  var buffer = new Buffer(imsmanifest)
  ///// zip.addFile("imsmanifest.xml",buffer) add imsmanifest.xml as a directory, so 0644 is necessary
  ///// zip.addLocalFile add file as a diretory, wrong attribute!
  zip.addFile("imsmanifest.xml", buffer, '', 0644)
  for (var i = 0; i < files.length; i++) {
    buffer = fs.readFileSync(files[i])
    zip.addFile(files[i], buffer, '', 0644)
  }
  //zip.toBuffer(); //need for big entry
  zip.writeZip(identifier + ".zip")
}


//item2package(process.argv[2])