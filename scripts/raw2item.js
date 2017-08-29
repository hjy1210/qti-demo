var fs = require('fs');
var archiver = require('archiver');
var AdmZip = require('adm-zip');

var DOMParser = require('xmldom').DOMParser
var XMLSerializer = require('xmldom').XMLSerializer
var root = '<?xml version="1.0" encoding="UTF-8" ?>\n<assessmentItem></assessmentItem>'

///// In TAO, identifier of manifest element can not identical to that of resource element.
function raw2item(rawxml) {
  function manipulateChoiceInteraction(node) {
    var cI=node
    var cardinality = cI.getAttribute("cardinality")
    var correct = cI.getAttribute("correct")
    var quota = parseFloat(cI.getAttribute("quota"))
    cI.removeAttribute("cardinality")
    cI.removeAttribute("correct")
    cI.removeAttribute("quota")

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
    var choiceInteraction = cI /////imsroot.createElement('choiceInteraction')
    choiceInteraction.setAttribute('responseIdentifier', respId)
    choiceInteraction.setAttribute('shuffle', "false")
    choiceInteraction.setAttribute('maxChoices', cardinality === "single" ? "1" : "0")
    
    //itemBody.appendChild(choiceInteraction)
    //moveChildren(cI, choiceInteraction)
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
  function manipulateInlineChoiceInteraction(node) {
    var iCI=node
    var correct = iCI.getAttribute("correct")
    var quota = parseFloat(iCI.getAttribute("quota"))
    iCI.removeAttribute("correct")
    iCI.removeAttribute("quota")
    var respId = 'resp_' + identifier + "_" + respNdx
    //console.log(correct,quota,respId)
    var responseDeclarationStr=
      `<responseDeclaration identifier="${respId}" cardinality="single" baseType="identifier">
        <correctResponse>
          <value>${respId+"_"+correct}</value>
        </correctResponse>
      </responseDeclaration>`
    var responseDeclaration = new DOMParser().parseFromString(responseDeclarationStr).documentElement
    imsdoc.insertBefore(responseDeclaration, itemBody)
    var inlineChoiceInteraction = iCI /////imsroot.createElement('inlineChoiceInteraction')
    inlineChoiceInteraction.setAttribute('responseIdentifier', respId)
    inlineChoiceInteraction.setAttribute('shuffle', "false")
    /////itemBody.appendChild(inlineChoiceInteraction)
    /////moveChildren(iCI, inlineChoiceInteraction)
    var inlineChoices = inlineChoiceInteraction.getElementsByTagName('inlineChoice')
    var cursymbol = symbol.indexOf(correct[0]) >= 0 ? symbol : msymbol
    for (var i = 0; i < inlineChoices.length; i++) {
      inlineChoices[i].setAttribute('identifier', respId + "_" + cursymbol[i])
    }
    var rspcondstr=`<responseCondition><responseIf>
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
    </responseIf></responseCondition>`
    var responseCondition = new DOMParser().parseFromString(rspcondstr).documentElement
    responseProcessing.appendChild(responseCondition)
  }
  function manipulateGapMatchInteraction(node) {
    var gMI=node
    var respId = 'resp_' + identifier + "_" + respNdx
    var gapMatchInteraction = gMI /////imsroot.createElement('inlineChoiceInteraction')
    gapMatchInteraction.setAttribute('responseIdentifier', respId)
    gapMatchInteraction.setAttribute('shuffle', "false")
    //console.log(correct,quota,respId)
    
    var responseDeclarationStr=`<responseDeclaration identifier="${respId}" cardinality="multiple" baseType="directedPair"></responseDeclaration>`
    var responseDeclaration = new DOMParser().parseFromString(responseDeclarationStr).documentElement
  
    
    imsdoc.insertBefore(responseDeclaration, itemBody)
    var correctResponse=imsroot.createElement('correctResponse')
    responseDeclaration.appendChild(correctResponse)
    var mapping=imsroot.createElement('mapping')
    mapping.setAttribute("defaultValue","0")
    responseDeclaration.appendChild(mapping)

    /////itemBody.appendChild(inlineChoiceInteraction)
    /////moveChildren(iCI, inlineChoiceInteraction)
    var gaps=gapMatchInteraction.getElementsByTagName('gap')
    var gapTexts = gapMatchInteraction.getElementsByTagName('gapText')
    var cursymbol = symbol.indexOf(gaps[0].getAttribute('correct')[0]) >= 0 ? symbol : msymbol
    for (var i = 0; i < gapTexts.length; i++) {
      gapTexts[i].setAttribute('identifier', respId + "_" + cursymbol[i])
      gapTexts[i].setAttribute('matchMax', "1")
      gapTexts[i].setAttribute('matchMin', "0")
    }

   for (var i = 0; i < gaps.length; i++) {
      gaps[i].setAttribute('identifier', respId + "_gap" +(i+1))
      gaps[i].setAttribute('required', "false")
      var correctvalue=respId+"_"+gaps[i].getAttribute("correct")
      var correctvalue=correctvalue+" "+ gaps[i].getAttribute('identifier')
      var value=imsroot.createElement('value')
      value.appendChild(imsroot.createTextNode(correctvalue))
      correctResponse.appendChild(value)
      var mapEntry=imsroot.createElement('mapEntry')
      mapping.appendChild(mapEntry)
      mapEntry.setAttribute("mapKey",correctvalue)
      mapEntry.setAttribute("mappedValue",gaps[i].getAttribute("quota"))
      gaps[i].removeAttribute("quota")
      gaps[i].removeAttribute("correct")
    }

    

    var rspcondstr=`<responseCondition>
		<responseIf>
			<isNull>
				<variable identifier="${respId}"/>
			</isNull>
      <setOutcomeValue identifier="SCORE">
       <sum>
        <variable identifier="SCORE">
        <baseValue baseType="float">0.0</baseValue>
       </sum>
			</setOutcomeValue>
		</responseIf>
		<responseElse>
			<setOutcomeValue identifier="SCORE">
      <sum>
        <variable identifier="SCORE">
        <mapResponse identifier="${respId}"/>
      </sum>
			</setOutcomeValue>
		</responseElse>
	</responseCondition>`
    var responseCondition = new DOMParser().parseFromString(rspcondstr).documentElement
    responseProcessing.appendChild(responseCondition)
  }

  function modifyNode(node){
    for (var i = 0; i < node.childNodes.length; i++) {
      //console.log(node.nodeType,node.nodeName)
      if (node.childNodes[i].nodeName === "choiceInteraction") {
        //console.log("correct", iB.childNodes[i].getAttribute("correct"))
        //var cI = node.childNodes[i]
        respNdx++
        manipulateChoiceInteraction(node.childNodes[i])
      } else if (node.childNodes[i].nodeName === "inlineChoiceInteraction") {
        //var iCI = node.childNodes[i]
        respNdx++
        manipulateInlineChoiceInteraction(node.childNodes[i])
      } else if (node.childNodes[i].nodeName === "gapMatchInteraction") {
        //var iCI = node.childNodes[i]
        respNdx++
        manipulateGapMatchInteraction(node.childNodes[i])
      } else if (node.childNodes[i].nodeName !== "#text") {
        modifyNode(node.childNodes[i])
      }
    }
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
  modifyNode(iB)
  moveChildren(iB,itemBody)
  /*for (var i = 0; i < iB.childNodes.length; i++) {
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
  }*/
  
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