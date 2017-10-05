var fs = require('fs');
var archiver = require('archiver');
var AdmZip = require('adm-zip');
//var toMML=require('./util2')
var toMML = require('./cml2xml')
// const options = {
//   format: ["TeX"],
// 
//     TeX: {
//       Macros: { ceec: ['{\\fbox{#1}}', 1] }
//     }
//   }
// }
var DOMParser = require('xmldom').DOMParser
var XMLSerializer = require('xmldom').XMLSerializer
//var root = '<?xml version="1.0" encoding="UTF-8" ?>\n<assessmentItem></assessmentItem>'
///// In TAO, identifier of manifest element can not identical to that of resource element.
module.exports = function cml2item(rawxml,type) {
  function manipulateChoiceInteraction(node) {
    var cI = node
    var cardinality = cI.getAttribute("cardinality")
    var correct = cI.getAttribute("correct")
    var quota = parseFloat(cI.getAttribute("quota"))
    cI.removeAttribute("cardinality")
    cI.removeAttribute("correct")
    cI.removeAttribute("quota")

    var scorendxStr=`<outcomeDeclaration identifier="SCORE_${respNdx}" cardinality="single"
        baseType="float">
      <defaultValue>
        <value>0</value>
      </defaultValue>
      </outcomeDeclaration>`
    //console.log("1",new XMLSerializer().serializeToString(outcomeDeclaration))
    //console.log("2",new XMLSerializer().serializeToString(imsdoc))
    imsdoc.insertBefore(new DOMParser().parseFromString(scorendxStr).documentElement,
      endofOutcomeDeclaration)
    
    var respId = 'r_' + respNdx
    var responseStr=
      `<responseDeclaration identifier="${respId}" cardinality="${cardinality}" baseType="identifier">
        <correctResponse/>
        <mapping />
       </responseDeclaration>
      `
    var responseDeclaration=new DOMParser().parseFromString(responseStr).documentElement
    var correctResponse=responseDeclaration.getElementsByTagName('correctResponse')[0]
    var mapping=responseDeclaration.getElementsByTagName('mapping')[0]

    if (cardinality !== "multiple") {
      mapping.setAttribute('defaultValue', '0')
      var value = imsroot.createElement('value')
      value.appendChild(imsroot.createTextNode(respId + "_" + correct))
      correctResponse.appendChild(value)
      var mapEntry=imsroot.createElement('mapEntry')
      mapEntry.setAttribute('mapKey', respId + "_" + correct)
      mapEntry.setAttribute('mappedValue', "" + quota)
      mapping.appendChild(mapEntry)
    } else {
      mapping.setAttribute('defaultValue', '-1')
      var value = imsroot.createElement('value')
      value.appendChild(imsroot.createTextNode(respId + "_" + correct))
      correctResponse.appendChild(value)
      for (var i = 0; i < correct.length; i++) {
        var mapEntry = imsroot.createElement('mapEntry')
        mapEntry.setAttribute('mapKey', respId + "_" + correct[i])
        mapEntry.setAttribute('mappedValue', "1")
        mapping.appendChild(mapEntry)
      }
    }
    //console.log(new XMLSerializer().serializeToString(responseDeclaration))
    imsdoc.insertBefore(responseDeclaration, endofResponseDeclaration)

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
            <setOutcomeValue identifier="SCORE_${respNdx}">
              <sum>
                <variable identifier="SCORE_${respNdx}"/>
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
            <setOutcomeValue identifier="SCORE_${respNdx}">
             <sum>
              <variable identifier="SCORE_${respNdx}"/>
              <baseValue baseType="float">0.0</baseValue>
             </sum>
            </setOutcomeValue>
          </responseIf>
          <responseElse>
            <setOutcomeValue identifier="SCORE_${respNdx}">
             <sum>
              <variable identifier="SCORE_${respNdx}"/>
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
    var sumStr = `<setOutcomeValue identifier="SCORE">
        <sum>
        <variable identifier="SCORE"/>
        <variable identifier="SCORE_${respNdx}"/>
        </sum>
      </setOutcomeValue>`
    responseProcessing.appendChild(new DOMParser().parseFromString(sumStr).documentElement)
  }
  function manipulateInlineChoiceInteraction(node) {
    var iCI = node
    var correct = iCI.getAttribute("correct")
    var quota = parseFloat(iCI.getAttribute("quota"))
    iCI.removeAttribute("correct")
    iCI.removeAttribute("quota")
    var respId = 'r_' + respNdx
    
    var scorendxStr=`<outcomeDeclaration identifier="SCORE_${respNdx}" cardinality="single"
      baseType="float">
        <defaultValue>
          <value>0</value>
        </defaultValue>
      </outcomeDeclaration>`
      //console.log("1",new XMLSerializer().serializeToString(outcomeDeclaration))
      //console.log("2",new XMLSerializer().serializeToString(imsdoc))
    imsdoc.insertBefore(new DOMParser().parseFromString(scorendxStr).documentElement,
        endofOutcomeDeclaration)

    //console.log(correct,quota,respId)
    var responseDeclarationStr =
      `<responseDeclaration identifier="${respId}" cardinality="single" baseType="identifier">
            <correctResponse>
            <value>${respId + "_" + correct}</value>
            </correctResponse>
            </responseDeclaration>`
    var responseDeclaration = new DOMParser().parseFromString(responseDeclarationStr).documentElement
    imsdoc.insertBefore(responseDeclaration, endofResponseDeclaration)

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

    var rspcondstr = 
     `<responseCondition>
       <responseIf>
        <match>
          <variable identifier="${respId}"/>
          <correct identifier="${respId}"/>
        </match>
        <setOutcomeValue identifier="SCORE_${respNdx}">
          <sum>
            <variable identifier="SCORE_${respNdx}" />
            <baseValue baseType="float">${quota}</baseValue>
          </sum>
        </setOutcomeValue>
       </responseIf>
      </responseCondition>`
    var sumStr=
      `<setOutcomeValue identifier="SCORE">
        <sum>
          <variable identifier="SCORE" />
          <variable identifier="SCORE_${respNdx}" />
        </sum>
      </setOutcomeValue identifier="SCORE">
      `
    var responseCondition = new DOMParser().parseFromString(rspcondstr).documentElement
    responseProcessing.appendChild(responseCondition)
    responseProcessing.appendChild(new DOMParser().parseFromString(sumStr).documentElement)
  }
  function manipulateGroupInlineChoiceInteraction(node) {
    var div = imsroot.createElement('div')
    var nsymbol = "1234567890MN"
    ///// msymbol contains - and # which can not be in identidier, use M(minus) instead of -, N(number) instead of #
    var gICI = node
    var correct = gICI.getAttribute("correct")
    var quota = parseFloat(gICI.getAttribute("quota"))
    gICI.removeAttribute("correct")
    gICI.removeAttribute("quota")
    var respId // = 'resp_' + identifier + "_" + respNdx
    var scorendxStr=
      `<outcomeDeclaration identifier="SCORE_${respNdx}" cardinality="single" baseType="float">
        <defaultValue>
          <value>0</value>
        </defaultValue>
      </outcomeDeclaration>`
      //console.log("1",new XMLSerializer().serializeToString(outcomeDeclaration))
      //console.log("2",new XMLSerializer().serializeToString(imsdoc))
      imsdoc.insertBefore(new DOMParser().parseFromString(scorendxStr).documentElement,
        endofOutcomeDeclaration)

    var groupSize = correct.length
    var rspcondstr = 
      `<responseCondition>
        <responseIf>
          <and>
          </and>
          <setOutcomeValue identifier="SCORE_${respNdx}">
            <sum>
              <variable identifier="SCORE_${respNdx}" />
              <baseValue baseType="float">${quota}</baseValue>
            </sum>
          </setOutcomeValue>
        </responseIf>
      </responseCondition>`
    var responseCondition = new DOMParser().parseFromString(rspcondstr).documentElement
    responseProcessing.appendChild(responseCondition)
    var sumStr = 
      `<setOutcomeValue identifier="SCORE">
        <sum>
          <variable identifier="SCORE"/>
          <variable identifier="SCORE_${respNdx}"/>
        </sum>
      </setOutcomeValue>`
    responseProcessing.appendChild(new DOMParser().parseFromString(sumStr).documentElement)

    var and = responseCondition.getElementsByTagName('and')[0]
    for (var k = 0; k < groupSize; k++) {
      respId = 'r_' + respNdx+"_" + (k+1)
      // respId = 'resp_' + (respNdx + k)
      var responseDeclarationStr =
        `<responseDeclaration identifier="${respId}" cardinality="single" baseType="identifier">
              <correctResponse>
              <value>${respId + "_" + nsymbol[msymbol.indexOf(correct[k])]}</value>
              </correctResponse>
              </responseDeclaration>`
      var responseDeclaration = new DOMParser().parseFromString(responseDeclarationStr).documentElement
      imsdoc.insertBefore(responseDeclaration, endofResponseDeclaration)

      var inlineChoiceInteraction = imsroot.createElement('inlineChoiceInteraction')
      inlineChoiceInteraction.setAttribute('responseIdentifier', respId)
      inlineChoiceInteraction.setAttribute('shuffle', "false")
      //var inlineChoices = inlineChoiceInteraction.getElementsByTagName('inlineChoice')
      //var cursymbol = symbol.indexOf(correct[0]) >= 0 ? symbol : msymbol
      for (var i = 0; i < msymbol.length; i++) {
        var inlineChoiceStr = `<inlineChoice identifier="${respId + '_' + nsymbol[i]}">${msymbol[i]}</inlineChoice>`
        var inlineChoice = new DOMParser().parseFromString(inlineChoiceStr).documentElement
        inlineChoiceInteraction.appendChild(inlineChoice)
      }
      var text = ` \\(\\ceec{${k + 1}}\\)=`
      div.appendChild(imsroot.createTextNode(text))
      div.appendChild(inlineChoiceInteraction)
      var matchStr = `<match><variable identifier="${respId}"/><correct identifier="${respId}"/></match>`
      var match = new DOMParser().parseFromString(matchStr).documentElement
      and.appendChild(match)
    }
    imsdoc.replaceChild(div, node)
  }
  function manipulateGapMatchInteraction(node) {
    var gMI = node
    var respId = 'r_' + respNdx
    var gapMatchInteraction = gMI /////imsroot.createElement('inlineChoiceInteraction')
    gapMatchInteraction.setAttribute('responseIdentifier', respId)
    gapMatchInteraction.setAttribute('shuffle', "false")
    //console.log(correct,quota,respId)
    var scorendxStr=
      `<outcomeDeclaration identifier="SCORE_${respNdx}" cardinality="single"  baseType="float">
        <defaultValue>
          <value>0</value>
        </defaultValue>
      </outcomeDeclaration>`
      //console.log("1",new XMLSerializer().serializeToString(outcomeDeclaration))
      //console.log("2",new XMLSerializer().serializeToString(imsdoc))
    imsdoc.insertBefore(new DOMParser().parseFromString(scorendxStr).documentElement,
      endofOutcomeDeclaration)

    var responseDeclarationStr = `<responseDeclaration identifier="${respId}" cardinality="multiple" baseType="directedPair"></responseDeclaration>`
    var responseDeclaration = new DOMParser().parseFromString(responseDeclarationStr).documentElement
    imsdoc.insertBefore(responseDeclaration, endofResponseDeclaration)

    var correctResponse = imsroot.createElement('correctResponse')
    responseDeclaration.appendChild(correctResponse)
    var mapping = imsroot.createElement('mapping')
    mapping.setAttribute("defaultValue", "0")
    responseDeclaration.appendChild(mapping)

    /////itemBody.appendChild(inlineChoiceInteraction)
    /////moveChildren(iCI, inlineChoiceInteraction)
    var gaps = gapMatchInteraction.getElementsByTagName('gap')
    var gapTexts = gapMatchInteraction.getElementsByTagName('gapText')
    var cursymbol = symbol.indexOf(gaps[0].getAttribute('correct')[0]) >= 0 ? symbol : msymbol
    for (var i = 0; i < gapTexts.length; i++) {
      gapTexts[i].setAttribute('identifier', respId + "_" + cursymbol[i])
      gapTexts[i].setAttribute('matchMax', "1")
      gapTexts[i].setAttribute('matchMin', "0")
    }

    for (var i = 0; i < gaps.length; i++) {
      gaps[i].setAttribute('identifier', respId + "_gap" + (i + 1))
      gaps[i].setAttribute('required', "false")
      var correctvalue = respId + "_" + gaps[i].getAttribute("correct")
      var correctvalue = correctvalue + " " + gaps[i].getAttribute('identifier')
      var value = imsroot.createElement('value')
      value.appendChild(imsroot.createTextNode(correctvalue))
      correctResponse.appendChild(value)
      var mapEntry = imsroot.createElement('mapEntry')
      mapping.appendChild(mapEntry)
      mapEntry.setAttribute("mapKey", correctvalue)
      mapEntry.setAttribute("mappedValue", gaps[i].getAttribute("quota"))
      gaps[i].removeAttribute("quota")
      gaps[i].removeAttribute("correct")
    }

    var rspcondstr = 
      `<responseCondition>
		    <responseIf>
			    <isNull>
				    <variable identifier="${respId}"/>
			    </isNull>
          <setOutcomeValue identifier="SCORE">
            <sum>
              <variable identifier="SCORE_${respNdx}"/>
              <baseValue baseType="float">0.0</baseValue>
            </sum>
			    </setOutcomeValue>
		    </responseIf>
		    <responseElse>
			    <setOutcomeValue identifier="SCORE_${respNdx}">
            <sum>
              <variable identifier="SCORE_${respNdx}"/>
              <mapResponse identifier="${respId}"/>
            </sum>
			    </setOutcomeValue>
		    </responseElse>
	    </responseCondition>`
    var responseCondition = new DOMParser().parseFromString(rspcondstr).documentElement
    responseProcessing.appendChild(responseCondition)
    
    var sumStr = 
      `<setOutcomeValue identifier="SCORE">
        <sum>
          <variable identifier="SCORE"/>
          <variable identifier="SCORE_${respNdx}"/>
        </sum>
      </setOutcomeValue>`
    responseProcessing.appendChild(new DOMParser().parseFromString(sumStr).documentElement)
  }

  function modifyNode(node) {
    if (!node.hasChildNodes()) return
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
      } else if (node.childNodes[i].nodeName === "groupInlineChoiceInteraction") {
        //var iCI = node.childNodes[i]
        respNdx++
        //var len=node.childNodes[i].getAttribute("correct").length
        manipulateGroupInlineChoiceInteraction(node.childNodes[i])
        //respNdx = respNdx + (len - 1)
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
  var root=`<assessmentItem 
    xmlns="http://www.imsglobal.org/xsd/imsqti_v2p1" 
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.imsglobal.org/xsd/imsqti_v2p1  http://www.imsglobal.org/xsd/qti/qtiv2p2/imsqti_v2p1.xsd" 
    identifier="${identifier}" title="${identifier}" adaptive="false" timeDependent="false">
    <endofResponseDeclaration/>
    <outcomeDeclaration identifier="SCORE" cardinality="single" baseType="float">
      <defaultValue>
        <value>0</value>
      </defaultValue>
    </outcomeDeclaration>
    <endofOutcomeDeclaration/>
    <stylesheet href="styles/style.css" type="text/css"/>
    <itemBody>
    </itemBody>
    <responseProcessing>
    </responseProcessing>
    </assessmentItem>`
  var imsroot = new DOMParser().parseFromString(root)
  var imsdoc = imsroot.documentElement
  var itemBody=imsdoc.getElementsByTagName('itemBody')[0]
  var endofResponseDeclaration =imsdoc.getElementsByTagName('endofResponseDeclaration')[0]
  var endofOutcomeDeclaration =imsdoc.getElementsByTagName('endofOutcomeDeclaration')[0]
  var responseProcessing =imsdoc.getElementsByTagName('responseProcessing')[0]
  
  var iB = rawxmldoc.getElementsByTagName("itemBody")[0]

  var respNdx = 0
  modifyNode(iB)
  moveChildren(iB, itemBody)

  imsdoc.removeChild(endofResponseDeclaration)
  imsdoc.removeChild(endofOutcomeDeclaration)
  
  var needMML =  (type==="mml" || type==="pu")
  return new Promise(function (fulfill, reject) {
    if (needMML) {
      var itemBodyStr = new XMLSerializer().serializeToString(itemBody)
      toMML(itemBodyStr,type).then(result => {
        var newIB = new DOMParser().parseFromString(result).documentElement
        itemBody.parentNode.replaceChild(newIB, itemBody)
        fulfill(new XMLSerializer().serializeToString(imsdoc))
      })
    } else {
      fulfill(new XMLSerializer().serializeToString(imsdoc))
    }
  })
}
