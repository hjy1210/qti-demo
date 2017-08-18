var fs = require('fs');
var AdmZip = require('adm-zip');

var DOMParser = require('xmldom').DOMParser
var XMLSerializer = require('xmldom').XMLSerializer

function package2html(zipfile) {
  var zip = new AdmZip(zipfile)
  var zipEntries = zip.getEntries(); // an array of ZipEntry records
  /*console.log(zipEntries.length)
	zipEntries.forEach(function(zipEntry) {
    //console.log(zipEntry.toString()); // outputs zip entries information
    console.log(zip.readAsText(zipEntry.entryName))
		if (zipEntry.entryName == "imsmanifest.xml") {
		     console.log(zipEntry.getData().toString('utf8')); 
		}
  });*/
  var imsmanifestEntry = zipEntries.filter(entry => entry.entryName === 'imsmanifest.xml')
  if (imsmanifestEntry === null || imsmanifestEntry.length == 0) {
    throw new Error("imsmanifest.xml not in package")
  }
  var imsmanifestStr = zip.readAsText(imsmanifestEntry[0].entryName)
  //console.log(imsmanifestStr)
  var manifestDoc = new DOMParser().parseFromString(imsmanifestStr).documentElement
  var resource = manifestDoc.getElementsByTagName('resource')[0]
  if (resource === null) throw new Error("No resource element")
  var itemfilename = resource.getAttribute('href')
  var identifier = itemfilename.substr(0, itemfilename.lastIndexOf("."))
  //console.log(itemfilename)
  var itementry = zipEntries.filter(entry => entry.entryName === itemfilename)[0]
  if (itementry === null) throw new Error(itemfilename + " not in package")
  var fileElements = resource.getElementsByTagName("file")
  for (var i = 0; i < fileElements.length; i++) {
    if (zipEntries.filter(entry => entry.entryName === fileElements[i].getAttribute('href')).length == 0) {
      throw new Error(fileElements[i].getAttribute('href') + " not in package")
    }
  }
  var itemDoc = new DOMParser().parseFromString(zip.readAsText(itementry.entryName)).documentElement
  var itemstyle = itemDoc.getElementsByTagName("stylesheet")[0]
  //console.log(itemstyle!=null)
  var itemBody = itemDoc.getElementsByTagName("itemBody")[0]
  //console.log(new XMLSerializer().serializeToString(itemBody))
  var choiceInteractions = itemBody.getElementsByTagName("choiceInteraction")
  for (var i = 0; i < choiceInteractions.length; i++) {
    var responseIdentifier=choiceInteractions[i].getAttribute('responseIdentifier')
    var responseDeclaration=itemDoc.getElementsByTagName('responseDeclaration')[0]
    var isMultiple=responseDeclaration.getAttribute('cardinality')=="multiple"
    var prompt = choiceInteractions[i].getElementsByTagName("prompt")[0]
    var table = itemDoc.parentNode.createElement('table')
    var tr, td
    if (prompt) {
      var p = itemDoc.parentNode.createElement('p')
      moveChildren(prompt, p)
      tr = itemDoc.parentNode.createElement('tr')
      td = itemDoc.parentNode.createElement('td')
      td.setAttribute('colspan', 2)
      td.appendChild(p)
      tr.appendChild(td)
      table.appendChild(tr)
    }
    var simpleChoices = choiceInteractions[i].getElementsByTagName('simpleChoice')
    var button
    for (var j = 0; j < simpleChoices.length; j++) {
      tr = itemDoc.parentNode.createElement('tr')
      td = itemDoc.parentNode.createElement('td')
      td.setAttribute('width','30px')
      button = itemDoc.parentNode.createElement('input')
      button.setAttribute('name', "C_" + i)
      button.setAttribute('type',isMultiple?"checkbox":"radio")
      td.appendChild(button)
      tr.appendChild(td)
      td = itemDoc.parentNode.createElement('td')
      moveChildren(simpleChoices[j], td)
      tr.appendChild(td)
      table.appendChild(tr)
    }
    itemBody.replaceChild(table, choiceInteractions[i])
  }
  //console.log("pass1")
  var images = itemBody.getElementsByTagName('img')
  //console.log(images.length)
  for (var i = 0; i < images.length; i++) {
    var imgsrc = images[i].getAttribute('src')
    //console.log(imgsrc)
    var base64 = zip.readAsText(imgsrc, 'base64')
    base64 = "data:image/" + imgsrc.substr(imgsrc.lastIndexOf(".") + 1) + ";base64," + base64
    //console.log(base64)
    images[i].setAttribute('src', base64)
  }
  var div = itemDoc.parentNode.createElement('div')
  div.setAttribute('class', identifier)
  moveChildren(itemBody, div)
  var html = itemDoc.parentNode.createElement('html')
  var body = itemDoc.parentNode.createElement('body')
  var head = itemDoc.parentNode.createElement('head')
  var meta = itemDoc.parentNode.createElement('meta')
  meta.setAttribute('charset', "UTF-8")
  head.appendChild(meta)
  if (itemstyle != null) {
    //console.log(itemstyle)
    var style = itemDoc.parentNode.createElement('style')
    var stylecontent = zip.readAsText(itemstyle.getAttribute('href'))
    /*var adjust=""
    var ndx=stylecontent.indexOf('{')
    while (stylecontent.length>0 && ndx>=0){
      adjust+="."+identifier+" "+stylecontent.substr(0,ndx)
      stylecontent=stylecontent.substr(ndx)
      var rndx=stylecontent.indexOf('}')
      adjust+=stylecontent.substr(0,rndx+1)
      stylecontent=stylecontent.substr(rndx+1)
      ndx=stylecontent.indexOf('{')
    }
    style.appendChild(itemDoc.parentNode.createTextNode(adjust))*/
    stylecontent = stylecontent.replace(/[^}]*?{/g, x => `.${identifier} ${x}`)
    style.appendChild(itemDoc.parentNode.createTextNode(stylecontent))
    head.appendChild(style)
  }

  var script = itemDoc.parentNode.createElement('script')
  script.setAttribute('type', "text/x-mathjax-config")
  var content = `MathJax.Ajax.config.path["mhchem"] =  "https://cdnjs.cloudflare.com/ajax/libs/mathjax-mhchem/3.2.0";
MathJax.Hub.Config({
extensions: ["[mhchem]/mhchem.js"],
TeX: {
Macros: {
ceec: ["{\\\\fbox{#1 }}", 1],
ceece: ["\\\\underline{\  {\\\\fbox{#1 }}\  }", 1]
}
}
});`
  script.appendChild(itemDoc.parentNode.createTextNode(content))
  head.appendChild(script)
  script = itemDoc.parentNode.createElement('script')
  script.setAttribute('src', "https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.1/MathJax.js?config=TeX-AMS-MML_HTMLorMML")
  script.appendChild(itemDoc.parentNode.createTextNode(""))
  head.appendChild(script)
  //console.log("pass2")
  html.appendChild(head)
  html.appendChild(body)
  body.appendChild(div)
  var data = new XMLSerializer().serializeToString(html)
  //console.log(data)
  fs.writeFileSync(zipfile.substr(0, zipfile.lastIndexOf(".")) + ".html", data, "utf-8")
}

function moveChildren(from, to) {
  while (from.hasChildNodes()) {
    var node = from.firstChild
    to.appendChild(node.cloneNode(true))
    from.removeChild(node)
  }
}

package2html(process.argv[2])