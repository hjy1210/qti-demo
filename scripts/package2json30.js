/*****************
 * 原來package2html.js搭配qtidisplay.js，在一個網頁有兩個gapMatchInteraction的時候會互相衝突。
 * 原來package2htmlVue.js，在一個網頁有兩個gapMatchInteraction的時候也可以運作。
 * 用package2htmlJs.js搭配qtidisplayJs.js，負擔較輕。
**************/
var fs = require('fs');
var AdmZip = require('adm-zip');

var DOMParser = require('xmldom').DOMParser
var XMLSerializer = require('xmldom').XMLSerializer

function getInfo(itemStr,zip){
  var itemDoc = new DOMParser().parseFromString(itemStr,'text/xml').documentElement
  var myid=itemDoc.getAttribute("identifier")
  var responseInfo={}
  var outcomeInfo={}
  
  var responseDeclarations=itemDoc.getElementsByTagName("qti-response-declaration")
  for (var i=0;i<responseDeclarations.length;i++){
    var name=responseDeclarations[i].getAttribute("identifier")
    responseInfo[name]={}
    var baseType=responseDeclarations[i].getAttribute("base-type")
    var cardinality=responseDeclarations[i].getAttribute("cardinality")
    responseInfo[name]["base-type"]=baseType
    responseInfo[name]["cardinality"]=cardinality
    var correctResponse=responseDeclarations[i].getElementsByTagName("qti-correct-response")[0]
    if (correctResponse){
      responseInfo[name]["qti-correct-response"]=[]
      var corrects=correctResponse.getElementsByTagName("qti-value")
      for (var j=0;j<corrects.length;j++) {
        var value=corrects[j].childNodes[0].nodeValue
        if (baseType=="float") value=parseFloat(value)
        if (baseType=="integer") value=parseInt(value)
        responseInfo[name]["qti-correct-response"].push(value)
      }
      if (cardinality=="single") responseInfo[name]["qti-correct-response"]=responseInfo[name]["qti-correct-response"][0]
    }

    var mapping=responseDeclarations[i].getElementsByTagName("qti-mapping")[0]
    if (mapping){
      var mapStr=new XMLSerializer().serializeToString(mapping)
      mapStr=mapStr.replace(/>\s*?</g,"><")
      responseInfo[name]["qti-mapping"]=mapStr
    }
  }
  var outcomeDeclarations=itemDoc.getElementsByTagName("qti-outcome-declaration")
  for (var i=0;i<outcomeDeclarations.length;i++){
    name=outcomeDeclarations[i].getAttribute("identifier")
    var bT=outcomeDeclarations[i].getAttribute("base-type")
    var cardinality=outcomeDeclarations[i].getAttribute("cardinality")
    var defaultValue=outcomeDeclarations[i].getElementsByTagName("qti-default-value")[0]
    var values=defaultValue.getElementsByTagName("qti-value")
    outcomeInfo[name]=[]
    for (var j=0;j<values.length;j++){
      var v= bT==="float"?parseFloat(values[j].childNodes[0].nodeValue):parseInt(values[j].childNodes[0].nodeValue)
      outcomeInfo[name].push(v)
    }
    if (cardinality=='single') outcomeInfo[name] = outcomeInfo[name][0]
  }
  var responseProcessing=itemDoc.getElementsByTagName("qti-response-processing")[0]
  var responseStr=new XMLSerializer().serializeToString(responseProcessing)
  responseStr=responseStr.replace(/>\s*?</g,"><")
  var info={identifier:myid,responseInfo:responseInfo,outcomeInfo:outcomeInfo,
    responseProcessing:responseStr}
  var itemstyle = itemDoc.getElementsByTagName("qti-stylesheet")[0]
  if (itemstyle != null) {
    stylecontent = zip.readAsText(itemstyle.getAttribute('href'))
    //stylecontent = stylecontent.replace(/[^}]*?{/g, x => `.${identifier} ${x}`)
    info.styleContent=stylecontent
  } else {
    info.styleContent=""
  }
  return info
}


module.exports=function package2json(zipfile) {
  function filterEntriesWithName(name) {
    return zipEntries.filter(entry => entry.entryName === name)
  }
  function getResponseDeclation(responseIdentifier){
    var collections=itemDoc.getElementsByTagName("qti-response-declaration")
    var res
    for (var i=0;i<collections.length;i++){
      if (collections[i].getAttribute('identifier')===responseIdentifier){
        return collections[i]
      }
    }
    return res
  }
  
  function replaceChoiceInteractions() {
    var choiceInteractions = itemBody.getElementsByTagName("qti-choice-interaction")
    for (var i = choiceInteractions.length-1; i >=0; i--) {
      var responseIdentifier = choiceInteractions[i].getAttribute('response-identifier')
      var responseDeclaration=getResponseDeclation(responseIdentifier)
      //var isMultiple = choiceInteractions[i].getAttribute('maxChoices') == "0" || responseDeclaration.getAttribute('cardinality') === "multiple"
      var isMultiple =  responseDeclaration.getAttribute('cardinality') === "multiple"
      var prompt = choiceInteractions[i].getElementsByTagName("qti-prompt")[0]
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
      var simpleChoices = choiceInteractions[i].getElementsByTagName('qti-simple-choice')
      var button
      for (var j = 0; j < simpleChoices.length; j++) {
        tr = itemDoc.parentNode.createElement('tr')
        td = itemDoc.parentNode.createElement('td')
        td.setAttribute('width', '30px')
        button = itemDoc.parentNode.createElement('input')
        button.setAttribute('name', responseIdentifier)
        button.setAttribute('type', isMultiple ? "checkbox" : "radio")
        button.setAttribute('value',simpleChoices[j].getAttribute("identifier"))
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
        option.setAttribute("value",inlineChoices[j].getAttribute('identifier'))
        option.setAttribute("name",responseIdentifier)
        moveChildren(inlineChoices[j], option)
        select.appendChild(option)
      }
      //moveChildren(inlineChoiceInteractions[i], select)
      //itemBody.replaceChild(select, inlineChoiceInteractions[i])
      inlineChoiceInteractions[i].parentNode.replaceChild(select, inlineChoiceInteractions[i])
    }
  }
  function replaceGapMatchInteractions() {
    var activeIdentifier = null
    var gaps = []
    var gaptexts = []

    var gapMatchInteractions = itemBody.getElementsByTagName("gapMatchInteraction")
    var responseDeclarations = itemDoc.getElementsByTagName('responseDeclaration')
    //console.log(inlineChoiceInteractions.length)
    for (var ii = gapMatchInteractions.length - 1; ii >= 0; ii--) {
      var responseIdentifier = gapMatchInteractions[ii].getAttribute('responseIdentifier')
      //console.log(responseIdentifier)
      var gaptextElements = gapMatchInteractions[ii].getElementsByTagName('gapText')
      //console.log(gaptextElements.length)
      var div = itemDoc.parentNode.createElement('div')
      //div.setAttribute("name",responseIdentifier)
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
        li.setAttribute("class", "gaptext")
        li.setAttribute("name", responseIdentifier)
        for (var j = 0; j < gaptextElements[i].attributes.length; j++) {
          li.setAttribute(gaptextElements[i].attributes[j].name, gaptextElements[i].attributes[j].value)
        }
        li.appendChild(itemDoc.parentNode.createTextNode(gaptextElements[i].childNodes[0].nodeValue))
        //li.setAttribute("onclick", "gaptextClick(event,gaps,gaptexts)")
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
        span.setAttribute("name", responseIdentifier)
        span.appendChild(itemDoc.parentNode.createTextNode("\u00a0"))
        //span.setAttribute("click", "gapClick(event)")
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
  var itemInfo=getInfo(itemStr,zip)

  //fs.writeFileSync("responseInfo.json",JSON.stringify(getInfo(itemStr),null,2))

  var itemDoc = new DOMParser().parseFromString(itemStr,'text/xml').documentElement
  ///// itemDoc.removeAttribute("xmlns") ///// NOT work!!!!!
  itemDoc.setAttribute("xmlns","") /////otherwise each p element has xmlns attribute!!!
  itemStr=new XMLSerializer().serializeToString(itemDoc)
  itemDoc = new DOMParser().parseFromString(itemStr,'text/xml').documentElement

  var itemstyle = itemDoc.getElementsByTagName("qti-stylesheet")[0]
  var itemBody = itemDoc.getElementsByTagName("qti-item-body")[0]
  replaceChoiceInteractions()
  replaceInlineChoiceInteractions()
  replaceGapMatchInteractions()
  replaceImages()
  replaceAudios()
  //console.log("pass1")
  ///// following div contains all html element
  var div = itemDoc.parentNode.createElement('div')
  div.setAttribute('class', identifier)
  moveChildren(itemBody, div)
  itemInfo.html=new XMLSerializer().serializeToString(div)
  return itemInfo
  //fs.writeFileSync("itemInfo.json",JSON.stringify(itemInfo,null,2))
  ///// 
  //console.log(JSON.stringify(getInfo(zip),null,2))
}

function moveChildren(from, to) {
  while (from.hasChildNodes()) {
    var node = from.firstChild
    to.appendChild(node.cloneNode(true))
    from.removeChild(node)
  }
}

//package2html(process.argv[2])
//package2html("./mixed.zip")