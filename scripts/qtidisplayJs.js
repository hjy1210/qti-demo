function gaptextClick(e) {
  var name = e.target.getAttribute("name")
  if (e.target.classList.contains('deactive')) return;
  data[name].activeIdentifier = e.target.getAttribute("identifier")
  for (var i = 0; i < data[name].gaps.length; i++) {
    data[name].gaps[i].classList.add("canfill")
  }
  e.target.classList.add('active')
  data[name].activeIdentifier = e.target.getAttribute('identifier')
  for (var i = 0; i < data[name].gaptexts.length; i++) {
    if (data[name].gaptexts[i] === e.target) continue
    data[name].gaptexts[i].classList.remove('active')
  }
  //console.log("gaptext", e.target)
}
function gapClick(e) {
  var name = e.target.getAttribute("name")
  if (!e.target.classList.contains('canfill') && !e.target.classList.contains('filled')) return
  if (e.target.classList.contains('filled')) {
    var value = e.target.getAttribute('value')
    data[name].gapmap[value].classList.remove('deactive')
    if (!data[name].activeIdentifier) {
      e.target.classList.remove('filled')
      e.target.removeAttribute('value')
      e.target.innerHTML = "\u00a0"
    }
  }
  if (data[name].activeIdentifier) {
    e.target.childNodes[0].nodeValue = data[name].gapmap[data[name].activeIdentifier].childNodes[0].nodeValue
    e.target.setAttribute('value', data[name].activeIdentifier)
    e.target.classList.add('filled')
    data[name].gapmap[data[name].activeIdentifier].classList.add('deactive')
  }
  data[name].activeIdentifier = null
  for (var i = 0; i < data[name].gaps.length; i++) data[name].gaps[i].classList.remove('canfill')
  for (var i = 0; i < data[name].gaptexts.length; i++) data[name].gaptexts[i].classList.remove('active')
}

var responses = {}
var outcomes={}
var corrects={}
var itemInfo
var processing
function score(node) {
  switch (node.nodeName) {
    case "responseCondition":
      score(node.childNodes[0])
    case "variable":
      var id = node.getAttribute("identifier")
      if (outcomes[id]!=null) return outcomes[id]
      //if (itemInfo.outcomeInfo[id]!=null) return parseFloat(itemInfo.outcomeInfo[id])
      if (responses[id]!=null) return responses[id][0]
      return null
      break
    case "isNull":
      var v = score(node.childNodes[0])
      return (v===undefined || v === null || v.length === 0) ? true : false
    case "not":
      var v = score(node.childNodes[0])
      return !v
    case "setOutcomeValue":
      //itemInfo.outcomeInfo[node.getAttribute("identifier")] = score(node.childNodes[0])
      outcomes[node.getAttribute("identifier")]=score(node.childNodes[0])
      return
    case "sum":
      var sum = 0
      for (var i = 0; i < node.childNodes.length; i++) {
        sum += score(node.childNodes[i])
      }
      return sum
    case "mapResponse":
      var mapping = itemInfo.responseInfo[node.getAttribute("identifier")].mapping
      if (typeof mapping === "string") {
        itemInfo.responseInfo[node.getAttribute("identifier")].mapping = new DOMParser().parseFromString(mapping,"text/xml").documentElement
        mapping = itemInfo.responseInfo[node.getAttribute("identifier")].mapping
      }
      var v=0
      var id=node.getAttribute("identifier")
      var defaultValue=mapping.getAttribute("defaultValue")
      for (var i=0;i<responses[id].length;i++){
        var value=defaultValue
        for (var j=0;j<mapping.childNodes.length;j++){
          if (mapping.childNodes[j].getAttribute("mapKey")===responses[id][i]){
            value=mapping.childNodes[j].getAttribute("mappedValue")
            break
          }
        }
        v+=parseFloat(value)
      }
      return v
    case "baseValue":
      var s=node.getAttribute("baseType")
      var v=node.childNodes[0].nodeValue
      if (s==="float") v=parseFloat(v)
      return v
    case "responseIf":
        var cond=score(node.childNodes[0])
        if (cond) score(node.childNodes[1])
        break
    case "responseElse":
      score(node.childNodes[0])
      break
    case "max":
      var v=score(node.childNodes[0])
      for (var i=1;i<node.childNodes.length;i++){
        v=Math.max(v,score(node.childNodes[i]))
      }
      return v
    case "subtract":
      return score(node.childNodes[0])-score(node.childNodes[1])
    case "divide":
      return score(node.childNodes[0])/score(node.childNodes[1])
    case "product":
      return score(node.childNodes[0])*score(node.childNodes[1])
    case "correct":
      return corrects[node.getAttribute("identifier")]
    case "match":
      var v0=score(node.childNodes[0])
      var v1=score(node.childNodes[1])
      if (v0==null || v1==null || v0.length!=v1.length) return false
      for (var i=0;i<v0.length;i++){
        if (v0[i]!=v1[i]) return false
      }
      return true
    case "and":
      var res=score(node.childNodes[0])
      for (var i=0;i<node.childNodes[i];i++){
        res=res && score(node.childNodes[i])
      }
      return res
    default:
      for (var i = 0; i < node.childNodes.length; i++) score(node.childNodes[i])
  }
}
function getScore() {
  for (name in itemInfo.responseInfo) {
    responses[name] = getResponse(name)
    if (itemInfo.responseInfo[name].correctResponse){
      corrects[name]=itemInfo.responseInfo[name].correctResponse[0]
    }
  }
  for (name in itemInfo.outcomeInfo){
    outcomes[name]=itemInfo.outcomeInfo[name][0]
  }
  score(processing)
  console.log("responses",responses)
  console.log("corrects",corrects)
  console.log("outcomes",outcomes)
}

function handleFileSelect(f) {
  var reader = new FileReader();
  reader.onload = function (e) {
    itemInfo = JSON.parse(e.target.result)
    processing = new DOMParser().parseFromString(itemInfo.responseProcessing, "text/xml").documentElement
  }
  reader.readAsText(f, 'utf-8');
}

function getResponse(name) {
  var elements = document.getElementsByName(name)
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

data = {}

var gaptextElements = document.getElementsByClassName('gapText')
for (var i = 0; i < gaptextElements.length; i++) {
  //console.log(i,gaptextElements[i].classList)
  var name = gaptextElements[i].getAttribute("name")
  gaptextElements[i].addEventListener("click", gaptextClick)
  if (!data[name]) {
    data[name] = { gaptexts: [], gapmap: {}, gaps: [], activeIdentifier: null }
  }
  data[name].gaptexts.push(gaptextElements[i])
  data[name].gapmap[gaptextElements[i].getAttribute('identifier')] = gaptextElements[i]
}


var gapElements = document.getElementsByClassName('gap')
for (var i = 0; i < gapElements.length; i++) {
  //console.log(gapElements[i].classList)
  var name = gapElements[i].getAttribute("name")
  gapElements[i].addEventListener("click", gapClick)
  data[name].gaps.push(gapElements[i])
}


