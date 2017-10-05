///// testInfo must be in scope
function getResponse(identifier, name) {
  //var elements = document.getElementById(identifier).getElementsByName(name)
  name=identifier+"_"+name
  var elements = document.getElementById(identifier).querySelectorAll(`*[name='${name}']`)
  if (elements.length == 0) return "No name as " + name
  var res = []
  for (var i = 0; i < elements.length; i++) {
    if (elements[i].classList.contains('gap') && elements[i].getAttribute("value")) {
      res.push(elements[i].getAttribute("value") + " " + elements[i].getAttribute("identifier"))
    }
    else if (elements[i].tagName.toLowerCase() === "input" && elements[i].checked) res.push(elements[i].getAttribute("value"))
    else if (elements[i].tagName.toLowerCase() === "option" && elements[i].selected) res.push(elements[i].getAttribute("value"))
  }
  return res
}

function getAllResponse() {
  var res = {}
  for (var identifier in testInfo) {
    res[identifier] = {}
    for (var name in testInfo[identifier].responseInfo) {
      res[identifier][name] = getResponse(identifier, name)
    }
  }
  console.log(res)
}
function gaptextClick(e, identifier) {
  var name = e.target.getAttribute("name")
  if (e.target.classList.contains('deactive')) return;
  data[identifier][name].activeIdentifier = e.target.getAttribute("identifier")
  for (var i = 0; i < data[identifier][name].gaps.length; i++) {
    data[identifier][name].gaps[i].classList.add("canfill")
  }
  e.target.classList.add('active')
  data[identifier][name].activeIdentifier = e.target.getAttribute('identifier')
  for (var i = 0; i < data[identifier][name].gaptexts.length; i++) {
    if (data[identifier][name].gaptexts[i] === e.target) continue
    data[identifier][name].gaptexts[i].classList.remove('active')
  }
  //console.log("gaptext", e.target)
}

function gapClick(e, identifier) {
  var name = e.target.getAttribute("name")
  if (!e.target.classList.contains('canfill') && !e.target.classList.contains('filled')) return
  if (e.target.classList.contains('filled')) {
    var value = e.target.getAttribute('value')
    data[identifier][name].gapmap[value].classList.remove('deactive')
    if (!data[identifier][name].activeIdentifier) {
      e.target.classList.remove('filled')
      e.target.removeAttribute('value')
      e.target.innerHTML = "\u00a0"
    }
  }
  if (data[identifier][name].activeIdentifier) {
    e.target.childNodes[0].nodeValue = data[identifier][name].gapmap[data[identifier][name].activeIdentifier].childNodes[0].nodeValue
    e.target.setAttribute('value', data[identifier][name].activeIdentifier)
    e.target.classList.add('filled')
    data[identifier][name].gapmap[data[identifier][name].activeIdentifier].classList.add('deactive')
  }
  data[identifier][name].activeIdentifier = null
  for (var i = 0; i < data[identifier][name].gaps.length; i++) data[identifier][name].gaps[i].classList.remove('canfill')
  for (var i = 0; i < data[identifier][name].gaptexts.length; i++) data[identifier][name].gaptexts[i].classList.remove('active')
}

/*function handleFileSelect(f) {
  var reader = new FileReader();
  reader.onload = function (e) {
    testInfo = JSON.parse(e.target.result)
  }
  reader.readAsText(f, 'utf-8');
}*/

data = {}
for (var id in testInfo) {
  let identifier=id
  ////////// find all element with attribute name, prepend identifier+"_"
  var elements=document.getElementById(identifier).querySelectorAll("*[name]")
  for (j=0;j<elements.length;j++) elements[j].setAttribute('name',identifier+"_"+elements[j].getAttribute("name"))
  
  data[identifier] = {}
  var gaptextElements = document.getElementById(identifier).getElementsByClassName('gapText')
  for (var i = 0; i < gaptextElements.length; i++) {
    //console.log(i,gaptextElements[i].classList)
    var name = gaptextElements[i].getAttribute("name")
    gaptextElements[i].addEventListener("click", () => gaptextClick(event, identifier))
    if (!data[identifier][name]) {
      data[identifier][name] = { gaptexts: [], gapmap: {}, gaps: [], activeIdentifier: null }
    }
    data[identifier][name].gaptexts.push(gaptextElements[i])
    data[identifier][name].gapmap[gaptextElements[i].getAttribute('identifier')] = gaptextElements[i]
  }
  var gapElements = document.getElementById(identifier).getElementsByClassName('gap')
  for (var i = 0; i < gapElements.length; i++) {
    //console.log(gapElements[i].classList)
    var name = gapElements[i].getAttribute("name")
    gapElements[i].addEventListener("click", () => gapClick(event, identifier))
    data[identifier][name].gaps.push(gapElements[i])
  }
}
