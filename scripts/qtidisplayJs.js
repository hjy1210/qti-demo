function gaptextClick(e) {
  var group=e.target.getAttribute("group")
  if (e.target.classList.contains('deactive')) return;
  data[group].activeIdentifier = e.target.getAttribute("identifier")
  for (var i = 0; i < data[group].gaps.length; i++) {
    data[group].gaps[i].classList.add("canfill")
  }
  e.target.classList.add('active')
  data[group].activeIdentifier = e.target.getAttribute('identifier')
  for (var i = 0; i < data[group].gaptexts.length; i++) {
    if (data[group].gaptexts[i] === e.target) continue
    data[group].gaptexts[i].classList.remove('active')
  }
  //console.log("gaptext", e.target)
}
function gapClick(e) {
  var group=e.target.getAttribute("group")
  if (!e.target.classList.contains('canfill') && !e.target.classList.contains('filled')) return
  if (e.target.classList.contains('filled')) {
    var gaptextIdentifier = e.target.getAttribute('gaptextIdentifier')
    data[group].gapmap[gaptextIdentifier].classList.remove('deactive')
    if (!data[group].activeIdentifier) {
      e.target.classList.remove('filled')
      e.target.removeAttribute('gaptextIdentifier')
      e.target.innerHTML = "\u00a0"
    }
  }
  if (data[group].activeIdentifier) {
    e.target.childNodes[0].nodeValue = data[group].gapmap[data[group].activeIdentifier].childNodes[0].nodeValue
    e.target.setAttribute('gaptextIdentifier', data[group].activeIdentifier)
    e.target.classList.add('filled')
    data[group].gapmap[data[group].activeIdentifier].classList.add('deactive')
  }
  data[group].activeIdentifier = null
  for (var i = 0; i < data[group].gaps.length; i++) data[group].gaps[i].classList.remove('canfill')
  for (var i = 0; i < data[group].gaptexts.length; i++) data[group].gaptexts[i].classList.remove('active')
}

data={}
var gaptextElements = document.getElementsByClassName('gapText')
for (var i = 0; i < gaptextElements.length; i++) {
  //console.log(i,gaptextElements[i].classList)
  var group=gaptextElements[i].getAttribute("group")
  gaptextElements[i].addEventListener("click", gaptextClick)
  if (!data[group]) {
    data[group]={gaptexts:[],gapmap:{},gaps:[],activeIdentifier:null}
  }
  data[group].gaptexts.push(gaptextElements[i])
  data[group].gapmap[gaptextElements[i].getAttribute('identifier')] = gaptextElements[i]
}
//console.log('gaptexts',gaptexts)

var gapElements = document.getElementsByClassName('gap')
//console.log('gapElements',gapElements.length)

for (var i = 0; i < gapElements.length; i++) {
  //console.log(gapElements[i].classList)
  var group=gapElements[i].getAttribute("group")
  gapElements[i].addEventListener("click", gapClick)
  data[group].gaps.push(gapElements[i])
}
////console.log('gaps',gaps)
//console.log('gaptexts',gaptexts)
