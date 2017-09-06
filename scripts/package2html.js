var fs = require('fs');
var AdmZip = require('adm-zip');

var DOMParser = require('xmldom').DOMParser
var XMLSerializer = require('xmldom').XMLSerializer


module.exports=function package2html(zipfile) {
  function filterEntriesWithName(name) {
    return zipEntries.filter(entry => entry.entryName === name)
  }
  function replaceChoiceInteractions() {
    var choiceInteractions = itemBody.getElementsByTagName("choiceInteraction")
    for (var i = choiceInteractions.length-1; i >=0; i--) {
      var responseIdentifier = choiceInteractions[i].getAttribute('responseIdentifier')
      var responseDeclaration = itemDoc.getElementsByTagName('responseDeclaration')[i]
      //var isMultiple = responseDeclaration.getAttribute('cardinality') == "multiple"
      var isMultiple = choiceInteractions[i].getAttribute('maxChoices') == "0"
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
        td.setAttribute('width', '30px')
        button = itemDoc.parentNode.createElement('input')
        button.setAttribute('name', "C_" + i)
        button.setAttribute('type', isMultiple ? "checkbox" : "radio")
        td.appendChild(button)
        tr.appendChild(td)
        td = itemDoc.parentNode.createElement('td')
        moveChildren(simpleChoices[j], td)
        tr.appendChild(td)
        table.appendChild(tr)
      }
      itemBody.replaceChild(table, choiceInteractions[i])
    }
  }
  function replaceImages() {
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
  }
  function replaceAudios() {
    var images = itemBody.getElementsByTagName('audio')
    //console.log(images.length)
    for (var i = 0; i < images.length; i++) {
      var imgsrc = images[i].getAttribute('src')
      //console.log(imgsrc)
      var base64 = zip.readAsText(imgsrc, 'base64')
      base64 = "data:audio/" + imgsrc.substr(imgsrc.lastIndexOf(".") + 1) + ";base64," + base64
      //console.log(base64)
      images[i].setAttribute('src', base64)
    }
  }
  function replaceInlineChoiceInteractions() {
    var inlineChoiceInteractions = itemBody.getElementsByTagName("inlineChoiceInteraction")
    var responseDeclarations = itemDoc.getElementsByTagName('responseDeclaration')
    //console.log(inlineChoiceInteractions.length)
    for (var i = inlineChoiceInteractions.length - 1; i >= 0; i--) {
      var responseIdentifier = inlineChoiceInteractions[i].getAttribute('responseIdentifier')
      //console.log(responseIdentifier)
      var inlineChoices = inlineChoiceInteractions[i].getElementsByTagName('inlineChoice')
      var select = itemDoc.parentNode.createElement('select')
      var option = itemDoc.parentNode.createElement('option')
      option.appendChild(itemDoc.parentNode.createTextNode('-option-'))
      select.appendChild(option)
      for (var j = 0; j < inlineChoices.length; j++) {
        option = itemDoc.parentNode.createElement('option')
        moveChildren(inlineChoices[j], option)
        select.appendChild(option)
      }
      moveChildren(inlineChoiceInteractions[i], select)
      //itemBody.replaceChild(select, inlineChoiceInteractions[i])
      inlineChoiceInteractions[i].parentNode.replaceChild(select, inlineChoiceInteractions[i])
    }
  }
  function replaceGapMatchInteractions() {
    var activeIdentifier = null
    var gaps = []
    var gaptexts = []

    function gaptextClick(e) {
      if (e.target.classList.contains('deactive')) return;
      activeIdentifier = e.target.getAttribute("identifier")
      for (var i = 0; i < gaps.length; i++) {
        gaps[i].classList.add("canfill")
      }
      e.target.classList.add('active')
      activeIdentifier = e.target.getAttribute('identifier')
      for (var i = 0; i < gaptexts.length; i++) {
        if (gaptexts[i] === e.target || gaptexts[i].classList.contains("used")) continue
        gaptexts[i].classList.remove('active')
      }
      //console.log("gaptext", e.target)
    }
    function gapClick(e) {
      if (!e.target.classList.contains('canfill') && !e.target.classList.contains('filled')) return
      if (e.target.classList.contains('filled')) {
        var gaptextIdentifier = e.target.getAttribute('gaptextIdentifier')
        gapmap[gaptextIdentifier].classList.remove('deactive')
        if (!activeIdentifier) {
          e.target.classList.remove('filled')
          e.target.removeAttribute('gaptextIdentifier')
          e.target.innerHTML = "\u00a0"
        }
      }
      if (activeIdentifier) {
        e.target.childNodes[0].nodeValue = gapmap[activeIdentifier].childNodes[0].nodeValue
        e.target.setAttribute('gaptextIdentifier', activeIdentifier)
        e.target.classList.add('filled')
        gapmap[activeIdentifier].classList.add('deactive')
      }
      activeIdentifier = null
      for (var i = 0; i < gaps.length; i++) gaps[i].classList.remove('canfill')
      for (var i = 0; i < gaptexts.length; i++) gaptexts[i].classList.remove('active')
    }

    var gapMatchInteractions = itemBody.getElementsByTagName("gapMatchInteraction")
    var responseDeclarations = itemDoc.getElementsByTagName('responseDeclaration')
    //console.log(inlineChoiceInteractions.length)
    for (var ii = gapMatchInteractions.length - 1; ii >= 0; ii--) {
      var responseIdentifier = gapMatchInteractions[ii].getAttribute('responseIdentifier')
      //console.log(responseIdentifier)
      var gaptextElements = gapMatchInteractions[ii].getElementsByTagName('gapText')
      //console.log(gaptextElements.length)
      var div = itemDoc.parentNode.createElement('div')
      var ul = itemDoc.parentNode.createElement('ul')
      div.appendChild(ul)
      //var gaptexts = []
      var gapmap = {}
      for (var i = 0; i < gaptextElements.length; i++) {
        //console.log(gaptextElements[i].attributes[0].name, gaptextElements[i].attributes[0].value)
        //if (gaptextElements[i].getAttribute("class")==="gaptext") {
        //gaptextElements[i].addEventListener("click", gaptextClick)
        //gaptexts.push(gaptextElements[i])
        //gapmap[gaptextElements[i].getAttribute('identifier')] = gaptextElements[i]
        var li = itemDoc.parentNode.createElement('li')
        li.setAttribute("class", "gapText")
        for (var j = 0; j < gaptextElements[i].attributes.length; j++) {
          li.setAttribute(gaptextElements[i].attributes[j].name, gaptextElements[i].attributes[j].value)
        }
        li.appendChild(itemDoc.parentNode.createTextNode(gaptextElements[i].childNodes[0].nodeValue))
        li.setAttribute("onclick", "gaptextClick(event,gaps,gaptexts)")
        gaptexts = []
        gaptexts.push(li)
        gapmap[gaptextElements[i].getAttribute('identifier')] = li
        ul.appendChild(li)
        //console.log(li)
        //console.log(ul)
        //}
      }
      gaptextElements[0].parentNode.insertBefore(div, gaptextElements[0])
      for (var i = gaptextElements.length - 1; i >= 0; i--) gaptextElements[i].parentNode.removeChild(gaptextElements[i])
      var gapElements = gapMatchInteractions[ii].getElementsByTagName('gap')
      gaps = []
      for (var i = gapElements.length - 1; i >= 0; i--) {
        //if (gapElements[i].getAttribute("class") === "gap") {
        var span = itemDoc.parentNode.createElement('span')
        for (var j = 0; j < gapElements[i].attributes.length; j++) {
          span.setAttribute(gapElements[i].attributes[j].name, gapElements[i].attributes[j].value)
        }
        span.setAttribute("class", "gap")
        span.appendChild(itemDoc.parentNode.createTextNode("\u00a0"))
        span.setAttribute("click", "gapClick(event)")
        gaps.push(span)
        gapElements[i].parentNode.replaceChild(span, gapElements[i])
        //}
      }
      var div=itemDoc.parentNode.createElement('div')
      moveChildren(gapMatchInteractions[ii],div)
      gapMatchInteractions[ii].parentNode.replaceChild(div,gapMatchInteractions[ii])
    }
  }


  var zip = new AdmZip(zipfile)
  var zipEntries = zip.getEntries(); // an array of ZipEntry records
  var imsmanifestEntry = filterEntriesWithName('imsmanifest.xml')
  var imsmanifestStr = zip.readAsText(imsmanifestEntry[0].entryName)
  //console.log(imsmanifestStr)
  var manifestDoc = new DOMParser().parseFromString(imsmanifestStr).documentElement
  var resource = manifestDoc.getElementsByTagName('resource')[0]
  if (resource === null) throw new Error("No resource element")
  var itemfilename = resource.getAttribute('href')
  var identifier = itemfilename.substr(0, itemfilename.lastIndexOf("."))
  //console.log(itemfilename)
  var itementry = filterEntriesWithName(itemfilename)[0]
  if (itementry === null) throw new Error(itemfilename + " not in package")
  var fileElements = resource.getElementsByTagName("file")
  for (var i = 0; i < fileElements.length; i++) {
    if (filterEntriesWithName(fileElements[i].getAttribute('href')).length == 0) {
      throw new Error(fileElements[i].getAttribute('href') + " not in package")
    }
  }
  var itemStr=zip.readAsText(itementry.entryName)
  var itemDoc = new DOMParser().parseFromString(itemStr,'text/xml').documentElement
  ///// itemDoc.removeAttribute("xmlns") ///// NOT work!!!!!
  itemDoc.setAttribute("xmlns","") /////otherwise each p element has xmlns attribute!!!
  itemStr=new XMLSerializer().serializeToString(itemDoc)
  itemDoc = new DOMParser().parseFromString(itemStr,'text/xml').documentElement

  var itemstyle = itemDoc.getElementsByTagName("stylesheet")[0]
  var itemBody = itemDoc.getElementsByTagName("itemBody")[0]
  replaceChoiceInteractions()
  replaceInlineChoiceInteractions()
  replaceGapMatchInteractions()
  replaceImages()
  replaceAudios()
  //console.log("pass1")
  var div = itemDoc.parentNode.createElement('div')
  div.setAttribute('class', identifier)
  moveChildren(itemBody, div)
  //console.log(new XMLSerializer().serializeToString(div))
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
  var link = itemDoc.parentNode.createElement('link')
  link.setAttribute("rel", "stylesheet")
  link.setAttribute("type", "text/css")
  link.setAttribute("href", "scripts/qtidisplay.css")
  head.appendChild(link)
  script = itemDoc.parentNode.createElement('script')
  script.setAttribute('src', "scripts/qtidisplay.js")
  script.appendChild(itemDoc.parentNode.createTextNode(""))
  //console.log("pass2")
  html.appendChild(head)
  html.appendChild(body)
  body.appendChild(div)
  body.appendChild(script)
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

//package2html(process.argv[2])
//package2html("./sat2_chi_2016_01.zip")