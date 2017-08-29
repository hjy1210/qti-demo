var fs = require('fs');
var archiver = require('archiver');
var AdmZip = require('adm-zip');

var DOMParser = require('xmldom').DOMParser
var XMLSerializer = require('xmldom').XMLSerializer
var root = '<?xml version="1.0" encoding="UTF-8" ?>\n<assessmentItem></assessmentItem>'

///// In TAO, identifier of manifest element can not identical to that of resource element.
function raw2item(rawxml) {
  function manipulateChoiceInteraction() {
    var cardinality = cI.getAttribute("cardinality")
    var correct = cI.getAttribute("correct")
    var quota = parseFloat(cI.getAttribute("quota"))
    var responseDeclaration = imsroot.createElement('responseDeclaration')
    var respId = 'resp_' + identifier + "_" + respNdx.toString()
    responseDeclaration.setAttribute('identifier', respId)
    responseDeclaration.setAttribute('cardinality', cardinality)
    responseDeclaration.setAttribute('baseType', 'identifier')

    var correctResponse = imsroot.createElement('correctResponse')
    responseDeclaration.appendChild(correctResponse)
    var mapping = imsroot.createElement('mapping')
    responseDeclaration.appendChild(mapping)

    if (cardinality !== "multiple") {
      mapping.setAttribute('defaultValue', '0')
      var value = imsroot.createElement('value')
      value.appendChild(imsroot.createTextNode(respId + "_" + correct))
      correctResponse.appendChild(value)
      var mapEntry = imsroot.createElement('mapEntry')
      mapEntry.setAttribute('mapKey', respId + "_" + correct)
      mapEntry.setAttribute('mappedValue', "" + quota)
      mapping.appendChild(mapEntry)
    } else {
      mapping.setAttribute('defaultValue', '-1')
      for (var i = 0; i < correct.length; i++) {
        var value = imsroot.createElement('value')
        value.appendChild(imsroot.createTextNode(respId + "_" + correct))
        correctResponse.appendChild(value)
        var mapEntry = imsroot.createElement('mapEntry')
        mapEntry.setAttribute('mapKey', respId + "_" + correct[i])
        mapEntry.setAttribute('mappedValue', "1")
        mapping.appendChild(mapEntry)
      }
    }
    //console.log(new XMLSerializer().serializeToString(responseDeclaration))
    imsdoc.insertBefore(responseDeclaration, itemBody)
    var choiceInteraction = imsroot.createElement('choiceInteraction')
    choiceInteraction.setAttribute('responseIdentifier', respId)
    choiceInteraction.setAttribute('shuffle', "false")
    choiceInteraction.setAttribute('maxChoices', cardinality === "single" ? "1" : "0")
    itemBody.appendChild(choiceInteraction)
    moveChildren(cI, choiceInteraction)
    var simpleChoices = choiceInteraction.getElementsByTagName('simpleChoice')
    //var simpleChoices = choiceInteraction.getElementsByTagName('simpleChoice')
    var cursymbol = symbol.indexOf(correct[0]) >= 0 ? symbol : msymbol
    for (var i = 0; i < simpleChoices.length; i++) {
      simpleChoices[i].setAttribute('identifier', respId + "_" + cursymbol[i])
    }
    if (cardinality !== "multiple") {
      var rspcondstr = `<responseCondition>
          <responseIf>
            <not>
              <isNull>
                <variable identifier='${respId}'/>
              </isNull>
            </not>
            <setOutcomeValue identifier="SCORE">
              <sum>
                <variable identifier="SCORE"/>
                <mapResponse identifier='${respId}'/>
              </sum>
            </setOutcomeValue>
          </responseIf>
        </responseCondition>`
      var responseCondition = new DOMParser().parseFromString(rspcondstr).documentElement
      responseProcessing.appendChild(responseCondition)
    }
    else {
      var rspcondstr = `<responseCondition>
          <responseIf>
            <isNull>
              <variable identifier='${respId}'/>
            </isNull>
            <setOutcomeValue identifier="SCORE">
             <sum>
              <variable identifier="SCORE"/>
              <baseValue baseType="float">0.0</baseValue>
             </sum>
            </setOutcomeValue>
          </responseIf>
          <responseElse>
            <setOutcomeValue identifier="SCORE">
             <sum>
              <variable identifier="SCORE"/>
              <max>
                <baseValue baseType="float">0.0</baseValue>
                <product>
                  <baseValue baseType="float">${quota}</baseValue>
                  <subtract>
                    <baseValue baseType="float">1.0</baseValue>
                    <divide>
                      <product>
                        <baseValue baseType="float">2.0</baseValue>
                        <subtract>
                          <baseValue baseType="float">${correct.length.toString()}</baseValue>
                          <mapResponse identifier='${respId}'/>
                        </subtract>
                      </product>
                      <baseValue baseType="float">${simpleChoices.length}</baseValue>
                    </divide>
                  </subtract>
                </product>
              </max>
              </sum>
            </setOutcomeValue>
          </responseElse>
        </responseCondition>`
      var responseCondition = new DOMParser().parseFromString(rspcondstr).documentElement
      responseProcessing.appendChild(responseCondition)
      //console.log(new XMLSerializer().serializeToString(responseCondition) )
    }
  }
  function manipulateInlineChoiceInteraction() {
    var correct = iCI.getAttribute("correct")
    var quota = parseFloat(iCI.getAttribute("quota"))
    var respId = 'resp_' + identifier + "_" + respNdx
    console.log(correct,quota,respId)
    var responseDeclarationStr=
      `<responseDeclaration identifier="${respId}" cardinality="single" baseType="identifier">
        <correctResponse>
          <value>${correct}</value>
        </correctResponse>
      </responseDeclaration>`
    var responseDeclaration = new DOMParser().parseFromString(responseDeclarationStr).documentElement
    var outcomeDeclarationStr=`<outcomeDeclaration identifier="SCORE" cardinality="single" baseType="float"/>`
    var outcomeDeclaration=new DOMParser().parseFromString(outcomeDeclarationStr).documentElement
    imsdoc.insertBefore(responseDeclaration, itemBody)
    imsdoc.insertBefore(outcomeDeclaration, itemBody)
    var inlineChoiceInteraction = imsroot.createElement('inlineChoiceInteraction')
    inlineChoiceInteraction.setAttribute('responseIdentifier', respId)
    inlineChoiceInteraction.setAttribute('shuffle', "false")
    itemBody.appendChild(inlineChoiceInteraction)
    moveChildren(iCI, inlineChoiceInteraction)
    var inlineChoices = inlineChoiceInteraction.getElementsByTagName('inlineeChoice')
    var cursymbol = symbol.indexOf(correct[0]) >= 0 ? symbol : msymbol
    for (var i = 0; i < inlineChoices.length; i++) {
      inlineChoices[i].setAttribute('identifier', respId + "_" + cursymbol[i])
    }
    var rspcondstr=`<responseIf>
      <match>
        <variable identifier="${respId}"/>
        <correct identifier="${respId}"/>
      </match>
      <setOutcomeValue identifier="SCORE">
        <sum>
          <variable identifier="SCORE" />
          <baseValue baseType="float">${quota}</baseValue>
        </sum>
      </setOutcomeValue>
    </responseIf>`
    var responseCondition = new DOMParser().parseFromString(rspcondstr).documentElement
    responseProcessing.appendChild(responseCondition)
  }

  function moveChildren(from, to) {
    while (from.hasChildNodes()) {
      var node = from.firstChild
      to.appendChild(node.cloneNode(true))
      from.removeChild(node)
    }
  }

  //console.log(argv)
  //return
  var rawxmlroot = new DOMParser().parseFromString(rawxml)
  var rawxmldoc = rawxmlroot.documentElement
  var symbol = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  var msymbol = "1234567890-#"
  var identifier = rawxmldoc.getAttribute('identifier')
  //console.log('identifier', identifier)
  var imsroot = new DOMParser().parseFromString(root)
  var imsdoc = imsroot.documentElement
  imsdoc.setAttribute('xmlns', "http://www.imsglobal.org/xsd/imsqti_v2p1")
  imsdoc.setAttribute("xmlns:xsi", "http://www.w3.org/2001/XMLSchema-instance")
  imsdoc.setAttribute("xsi:schemaLocation", "http://www.imsglobal.org/xsd/imsqti_v2p1  http://www.imsglobal.org/xsd/qti/qtiv2p2/imsqti_v2p1.xsd")
  imsdoc.setAttribute("identifier", identifier)
  imsdoc.setAttribute("title", identifier)
  imsdoc.setAttribute("adaptive", "false")
  imsdoc.setAttribute("timeDependent", "false")

  var iB = rawxmldoc.getElementsByTagName("itemBody")[0]
  var itemBody = imsroot.createElement("itemBody")
  imsdoc.appendChild(itemBody)
  var responseProcessing = imsroot.createElement("responseProcessing")
  
  var respNdx = 0
  for (var i = 0; i < iB.childNodes.length; i++) {
    //console.log(node.nodeType,node.nodeName)
    if (iB.childNodes[i].nodeName === "choiceInteraction") {
      //console.log("correct", iB.childNodes[i].getAttribute("correct"))
      var cI = iB.childNodes[i]
      respNdx++
      manipulateChoiceInteraction()
    } else if (iB.childNodes[i].nodeName === "inlineChoiceInteraction") {
      var iCI = iB.childNodes[i]
      respNdx++
      manipulateInlineChoiceInteraction()
    } else {
      itemBody.appendChild(iB.childNodes[i].cloneNode(true))
    }
  }
  
  var outcomeDeclaration = imsroot.createElement('outcomeDeclaration')
  imsdoc.insertBefore(outcomeDeclaration, itemBody)
  outcomeDeclaration.setAttribute('identifier', "SCORE")
  outcomeDeclaration.setAttribute('cardinality', "single")
  outcomeDeclaration.setAttribute('baseType', "float")
  var defaultValue = imsroot.createElement('defaultValue')
  outcomeDeclaration.appendChild(defaultValue)
  var value = imsroot.createElement('value')
  defaultValue.appendChild(value)
  value.appendChild(imsroot.createTextNode("0"))

  ///// stylesheet must put at just before itemBody
  var stylesheet = imsroot.createElement("stylesheet")
  stylesheet.setAttribute('href', "styles/style.css")
  stylesheet.setAttribute('type', "text/css")
  imsdoc.insertBefore(stylesheet, itemBody)
  imsdoc.appendChild(responseProcessing)
  return new XMLSerializer().serializeToString(imsdoc)
}
var rawxml = fs.readFileSync(process.argv[2], "utf-8")
var data = raw2item(rawxml)
var xmlfile = process.argv[2].substr(0, process.argv[2].lastIndexOf('.')) + ".xml"
fs.writeFileSync(xmlfile, data, "utf-8")
//console.log(rawxml)
console.log("done")