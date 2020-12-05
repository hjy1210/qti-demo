var fs = require('fs');
var archiver = require('archiver');
var AdmZip = require('adm-zip');
let toMML = require('./cml2xml30')
var DOMParser = require('xmldom').DOMParser;
var XMLSerializer = require('xmldom').XMLSerializer;
//var root = '<?xml version="1.0" encoding="UTF-8" ?>\n<assessmentItem></assessmentItem>'
///// In TAO, identifier of manifest element can not identical to that of resource element.
module.exports = function cml2item(rawxml, type) {
	function manipulateChoiceInteraction(node) {
		var cI = node;
		var cardinality = cI.getAttribute('cardinality');
		var correct = cI.getAttribute('correct');
		var quota = parseFloat(cI.getAttribute('quota'));
		cI.removeAttribute('cardinality');
		cI.removeAttribute('correct');
		cI.removeAttribute('quota');

		var scorendxStr = `<qti-outcome-declaration identifier="SCORE_${respNdx}" cardinality="single"
        base-type="float">
      <qti-default-value>
        <qti-value>0</qti-value>
      </qti-default-value>
      </qti-outcome-declaration>`;
		//console.log("1",new XMLSerializer().serializeToString(outcomeDeclaration))
		//console.log("2",new XMLSerializer().serializeToString(imsdoc))
		imsdoc.insertBefore(new DOMParser().parseFromString(scorendxStr).documentElement, endofOutcomeDeclaration);

		var respId = 'r_' + respNdx;
		var responseStr = `<qti-response-declaration identifier="${respId}" cardinality="${cardinality}" base-type="identifier">
        <qti-correct-response/>
        <mapping />
       </qti-response-declaration>
      `;
		var responseDeclaration = new DOMParser().parseFromString(responseStr).documentElement;
		var correctResponse = responseDeclaration.getElementsByTagName('qti-correct-response')[0];
		var mapping = responseDeclaration.getElementsByTagName('mapping')[0];

		if (cardinality !== 'multiple') {
			mapping.setAttribute('default-value', '0');
			var value = imsroot.createElement('qti-value');
			value.appendChild(imsroot.createTextNode(respId + '_' + correct));
			correctResponse.appendChild(value);
			var mapEntry = imsroot.createElement('qti-map-entry');
			mapEntry.setAttribute('map-key', respId + '_' + correct);
			mapEntry.setAttribute('mapped-value', '' + quota);
			mapping.appendChild(mapEntry);
		} else {
			mapping.setAttribute('default-value', '-1');
			var value = imsroot.createElement('qti-value');
			value.appendChild(imsroot.createTextNode(respId + '_' + correct));
			correctResponse.appendChild(value);
			for (var i = 0; i < correct.length; i++) {
				var mapEntry = imsroot.createElement('qti-map-entry');
				mapEntry.setAttribute('map-key', respId + '_' + correct[i]);
				mapEntry.setAttribute('mapped-value', '1');
				mapping.appendChild(mapEntry);
			}
		}
		//console.log(new XMLSerializer().serializeToString(responseDeclaration))
		imsdoc.insertBefore(responseDeclaration, endofResponseDeclaration);

		var choiceInteraction = cI; /////imsroot.createElement('choiceInteraction')
		choiceInteraction.setAttribute('response-identifier', respId);
		choiceInteraction.setAttribute('shuffle', 'false');
		choiceInteraction.setAttribute('max-choices', cardinality === 'single' ? '1' : '0');

		//itemBody.appendChild(choiceInteraction)
		//moveChildren(cI, choiceInteraction)
		var simpleChoices = choiceInteraction.getElementsByTagName('simple-choice');
		//var simpleChoices = choiceInteraction.getElementsByTagName('simpleChoice')
		var cursymbol = symbol.indexOf(correct[0]) >= 0 ? symbol : msymbol;
		for (var i = 0; i < simpleChoices.length; i++) {
			simpleChoices[i].setAttribute('identifier', respId + '_' + cursymbol[i]);
		}
		if (cardinality !== 'multiple') {
			var rspcondstr = `<qti-response-condition>
          <qti-response-if>
            <qti-not>
              <qti-is-null>
                <qti-variable identifier='${respId}'/>
              </qti-is-null>
            </qti-not>
            <qti-set-outcome-value identifier="SCORE_${respNdx}">
              <qti-sum>
                <qti-variable identifier="SCORE_${respNdx}"/>
                <qti-map-response identifier='${respId}'/>
              </qti-sum>
            </qti-set-outcome-value>
          </qti-response-if>
          </qti-response-condition>`;
			var responseCondition = new DOMParser().parseFromString(rspcondstr).documentElement;
			responseProcessing.appendChild(responseCondition);
		} else {
			var rspcondstr = `<qti-response-condition>
          <qti-response-if>
            <qti-is-null>
              <qti-variable identifier='${respId}'/>
            </qti-is-null>
            <qti-set-outcome-value identifier="SCORE_${respNdx}">
             <qti-sum>
              <qti-variable identifier="SCORE_${respNdx}"/>
              <qti-base-value base-type="float">0.0</qti-base-value>
             </qti-sum>
            </qti-set-outcome-value>
          </qti-response-if>
          <qti-response-else>
            <qti-set-outcome-value identifier="SCORE_${respNdx}">
             <qti-sum>
              <qti-variable identifier="SCORE_${respNdx}"/>
              <qti-max>
                <qti-base-value base-type="float">0.0</qti-base-value>
                <qti-product>
                  <qti-base-value base-type="float">${quota}</qti-base-value>
                  <qti-subtract>
                    <qti-base-value base-type="float">1.0</qti-base-value>
                    <qti-divide>
                      <qti-product>
                        <qti-base-value base-type="float">2.0</qti-base-value>
                        <qti-subtract>
                          <qti-base-value base-type="float">${correct.length.toString()}</qti-base-value>
                          <qti-map-response identifier='${respId}'/>
                        </qti-subtract>
                      </qti-product>
                      <qti-base-value base-type="float">${simpleChoices.length}</qti-base-value>
                    </qti-divide>
                  </qti-subtract>
                </qti-product>
              </qti-max>
              </qti-sum>
            </qti-set-outcome-value>
          </qti-response-else>
          </qti-response-condition>`;
			var responseCondition = new DOMParser().parseFromString(rspcondstr).documentElement;
			responseProcessing.appendChild(responseCondition);
			//console.log(new XMLSerializer().serializeToString(responseCondition) )
		}
		var sumStr = `<qti-set-outcome-value identifier="SCORE">
        <qti-sum>
        <qti-variable identifier="SCORE"/>
        <qti-variable identifier="SCORE_${respNdx}"/>
        </qti-sum>
      </qti-set-outcome-value>`;
		responseProcessing.appendChild(new DOMParser().parseFromString(sumStr).documentElement);
	}
	function manipulateInlineChoiceInteraction(node) {
		var iCI = node;
		var correct = iCI.getAttribute('correct');
		var quota = parseFloat(iCI.getAttribute('quota'));
		iCI.removeAttribute('correct');
		iCI.removeAttribute('quota');
		var respId = 'r_' + respNdx;

		var scorendxStr = `<outcomeDeclaration identifier="SCORE_${respNdx}" cardinality="single"
      baseType="float">
        <defaultValue>
          <value>0</value>
        </defaultValue>
      </outcomeDeclaration>`;
		//console.log("1",new XMLSerializer().serializeToString(outcomeDeclaration))
		//console.log("2",new XMLSerializer().serializeToString(imsdoc))
		imsdoc.insertBefore(new DOMParser().parseFromString(scorendxStr).documentElement, endofOutcomeDeclaration);

		//console.log(correct,quota,respId)
		var responseDeclarationStr = `<responseDeclaration identifier="${respId}" cardinality="single" baseType="identifier">
            <correctResponse>
            <value>${respId + '_' + correct}</value>
            </correctResponse>
            </responseDeclaration>`;
		var responseDeclaration = new DOMParser().parseFromString(responseDeclarationStr).documentElement;
		imsdoc.insertBefore(responseDeclaration, endofResponseDeclaration);

		var inlineChoiceInteraction = iCI; /////imsroot.createElement('inlineChoiceInteraction')
		inlineChoiceInteraction.setAttribute('responseIdentifier', respId);
		inlineChoiceInteraction.setAttribute('shuffle', 'false');
		/////itemBody.appendChild(inlineChoiceInteraction)
		/////moveChildren(iCI, inlineChoiceInteraction)
		var inlineChoices = inlineChoiceInteraction.getElementsByTagName('inlineChoice');
		var cursymbol = symbol.indexOf(correct[0]) >= 0 ? symbol : msymbol;
		for (var i = 0; i < inlineChoices.length; i++) {
			inlineChoices[i].setAttribute('identifier', respId + '_' + cursymbol[i]);
		}

		var rspcondstr = `<responseCondition>
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
      </responseCondition>`;
		var sumStr = `<setOutcomeValue identifier="SCORE">
        <sum>
          <variable identifier="SCORE" />
          <variable identifier="SCORE_${respNdx}" />
        </sum>
      </setOutcomeValue identifier="SCORE">
      `;
		var responseCondition = new DOMParser().parseFromString(rspcondstr).documentElement;
		responseProcessing.appendChild(responseCondition);
		responseProcessing.appendChild(new DOMParser().parseFromString(sumStr).documentElement);
	}
	function manipulateGroupInlineChoiceInteraction(node) {
		var div = imsroot.createElement('div');
		var nsymbol = '1234567890MN';
		///// msymbol contains - and # which can not be in identidier, use M(minus) instead of -, N(number) instead of #
		var gICI = node;
		var correct = gICI.getAttribute('correct');
		var quota = parseFloat(gICI.getAttribute('quota'));
		gICI.removeAttribute('correct');
		gICI.removeAttribute('quota');
		var respId; // = 'resp_' + identifier + "_" + respNdx
		var scorendxStr = `<outcomeDeclaration identifier="SCORE_${respNdx}" cardinality="single" baseType="float">
        <defaultValue>
          <value>0</value>
        </defaultValue>
      </outcomeDeclaration>`;
		//console.log("1",new XMLSerializer().serializeToString(outcomeDeclaration))
		//console.log("2",new XMLSerializer().serializeToString(imsdoc))
		imsdoc.insertBefore(new DOMParser().parseFromString(scorendxStr).documentElement, endofOutcomeDeclaration);

		var groupSize = correct.length;
		var rspcondstr = `<responseCondition>
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
      </responseCondition>`;
		var responseCondition = new DOMParser().parseFromString(rspcondstr).documentElement;
		responseProcessing.appendChild(responseCondition);
		var sumStr = `<setOutcomeValue identifier="SCORE">
        <sum>
          <variable identifier="SCORE"/>
          <variable identifier="SCORE_${respNdx}"/>
        </sum>
      </setOutcomeValue>`;
		responseProcessing.appendChild(new DOMParser().parseFromString(sumStr).documentElement);

		var and = responseCondition.getElementsByTagName('and')[0];
		for (var k = 0; k < groupSize; k++) {
			respId = 'r_' + respNdx + '_' + (k + 1);
			// respId = 'resp_' + (respNdx + k)
			var responseDeclarationStr = `<responseDeclaration identifier="${respId}" cardinality="single" baseType="identifier">
              <correctResponse>
              <value>${respId + '_' + nsymbol[msymbol.indexOf(correct[k])]}</value>
              </correctResponse>
              </responseDeclaration>`;
			var responseDeclaration = new DOMParser().parseFromString(responseDeclarationStr).documentElement;
			imsdoc.insertBefore(responseDeclaration, endofResponseDeclaration);

			var inlineChoiceInteraction = imsroot.createElement('inlineChoiceInteraction');
			inlineChoiceInteraction.setAttribute('responseIdentifier', respId);
			inlineChoiceInteraction.setAttribute('shuffle', 'false');
			//var inlineChoices = inlineChoiceInteraction.getElementsByTagName('inlineChoice')
			//var cursymbol = symbol.indexOf(correct[0]) >= 0 ? symbol : msymbol
			for (var i = 0; i < msymbol.length; i++) {
				var inlineChoiceStr = `<inlineChoice identifier="${respId + '_' + nsymbol[i]}">${msymbol[
					i
				]}</inlineChoice>`;
				var inlineChoice = new DOMParser().parseFromString(inlineChoiceStr).documentElement;
				inlineChoiceInteraction.appendChild(inlineChoice);
			}
			var text = ` \\(\\ceec{${k + 1}}\\)=`;
			div.appendChild(imsroot.createTextNode(text));
			div.appendChild(inlineChoiceInteraction);
			var matchStr = `<match><variable identifier="${respId}"/><correct identifier="${respId}"/></match>`;
			var match = new DOMParser().parseFromString(matchStr).documentElement;
			and.appendChild(match);
		}
		imsdoc.replaceChild(div, node);
	}
	function manipulateGapMatchInteraction(node) {
		var gMI = node;
		var respId = 'r_' + respNdx;
		var gapMatchInteraction = gMI; /////imsroot.createElement('inlineChoiceInteraction')
		gapMatchInteraction.setAttribute('responseIdentifier', respId);
		gapMatchInteraction.setAttribute('shuffle', 'false');
		//console.log(correct,quota,respId)
		var scorendxStr = `<outcomeDeclaration identifier="SCORE_${respNdx}" cardinality="single"  baseType="float">
        <defaultValue>
          <value>0</value>
        </defaultValue>
      </outcomeDeclaration>`;
		//console.log("1",new XMLSerializer().serializeToString(outcomeDeclaration))
		//console.log("2",new XMLSerializer().serializeToString(imsdoc))
		imsdoc.insertBefore(new DOMParser().parseFromString(scorendxStr).documentElement, endofOutcomeDeclaration);

		var responseDeclarationStr = `<responseDeclaration identifier="${respId}" cardinality="multiple" baseType="directedPair"></responseDeclaration>`;
		var responseDeclaration = new DOMParser().parseFromString(responseDeclarationStr).documentElement;
		imsdoc.insertBefore(responseDeclaration, endofResponseDeclaration);

		var correctResponse = imsroot.createElement('correctResponse');
		responseDeclaration.appendChild(correctResponse);
		var mapping = imsroot.createElement('mapping');
		mapping.setAttribute('defaultValue', '0');
		responseDeclaration.appendChild(mapping);

		/////itemBody.appendChild(inlineChoiceInteraction)
		/////moveChildren(iCI, inlineChoiceInteraction)
		var gaps = gapMatchInteraction.getElementsByTagName('gap');
		var gapTexts = gapMatchInteraction.getElementsByTagName('gapText');
		var cursymbol = symbol.indexOf(gaps[0].getAttribute('correct')[0]) >= 0 ? symbol : msymbol;
		for (var i = 0; i < gapTexts.length; i++) {
			gapTexts[i].setAttribute('identifier', respId + '_' + cursymbol[i]);
			gapTexts[i].setAttribute('matchMax', '1');
			gapTexts[i].setAttribute('matchMin', '0');
		}

		for (var i = 0; i < gaps.length; i++) {
			gaps[i].setAttribute('identifier', respId + '_gap' + (i + 1));
			gaps[i].setAttribute('required', 'false');
			var correctvalue = respId + '_' + gaps[i].getAttribute('correct');
			var correctvalue = correctvalue + ' ' + gaps[i].getAttribute('identifier');
			var value = imsroot.createElement('value');
			value.appendChild(imsroot.createTextNode(correctvalue));
			correctResponse.appendChild(value);
			var mapEntry = imsroot.createElement('mapEntry');
			mapping.appendChild(mapEntry);
			mapEntry.setAttribute('mapKey', correctvalue);
			mapEntry.setAttribute('mappedValue', gaps[i].getAttribute('quota'));
			gaps[i].removeAttribute('quota');
			gaps[i].removeAttribute('correct');
		}

		var rspcondstr = `<responseCondition>
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
	    </responseCondition>`;
		var responseCondition = new DOMParser().parseFromString(rspcondstr).documentElement;
		responseProcessing.appendChild(responseCondition);

		var sumStr = `<setOutcomeValue identifier="SCORE">
        <sum>
          <variable identifier="SCORE"/>
          <variable identifier="SCORE_${respNdx}"/>
        </sum>
      </setOutcomeValue>`;
		responseProcessing.appendChild(new DOMParser().parseFromString(sumStr).documentElement);
	}

	function modifyNode(node) {
		if (!node.hasChildNodes()) return;
		for (var i = 0; i < node.childNodes.length; i++) {
			//console.log(node.nodeType,node.nodeName)
			if (node.childNodes[i].nodeName === 'choice-interaction') {
				//console.log("correct", iB.childNodes[i].getAttribute("correct"))
				//var cI = node.childNodes[i]
				respNdx++;
				manipulateChoiceInteraction(node.childNodes[i]);
			} else if (node.childNodes[i].nodeName === 'inlineChoiceInteraction') {
				//var iCI = node.childNodes[i]
				respNdx++;
				manipulateInlineChoiceInteraction(node.childNodes[i]);
			} else if (node.childNodes[i].nodeName === 'groupInlineChoiceInteraction') {
				//var iCI = node.childNodes[i]
				respNdx++;
				//var len=node.childNodes[i].getAttribute("correct").length
				manipulateGroupInlineChoiceInteraction(node.childNodes[i]);
				//respNdx = respNdx + (len - 1)
			} else if (node.childNodes[i].nodeName === 'gapMatchInteraction') {
				//var iCI = node.childNodes[i]
				respNdx++;
				manipulateGapMatchInteraction(node.childNodes[i]);
			} else if (node.childNodes[i].nodeName !== '#text') {
				modifyNode(node.childNodes[i]);
			}
		}
	}

	function moveChildren(from, to) {
		while (from.hasChildNodes()) {
			var node = from.firstChild;
			to.appendChild(node.cloneNode(true));
			from.removeChild(node);
		}
	}

	//console.log(argv)
	//return
	var rawxmlroot = new DOMParser().parseFromString(rawxml);
	var rawxmldoc = rawxmlroot.documentElement;
	var symbol = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
	var msymbol = '1234567890-#';
	var identifier = rawxmldoc.getAttribute('identifier');
	//console.log('identifier', identifier)
	var root = `<qti-assessment-item
	xmlns="http://www.imsglobal.org/xsd/qti/imsqtiasi_v3p0" 
	xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xsi:schemaLocation="http://www.imsglobal.org/xsd/imsqtiasi_v3p0 
	https://purl.imsglobal.org/spec/qti/v3p0/schema/xsd/imsqti_asiv3p0_v1p0.xsd" 
    identifier="${identifier}" title="${identifier}" timeDependent="false">
    <endofResponseDeclaration/>
    <qti-outcome-declaration identifier="SCORE" cardinality="single" baseType="float">
      <qti-default-value>
        <qti-value>0</qti-value>
      </qti-default-value>
    </qti-outcome-declaration>
    <endofOutcomeDeclaration/>
    <qti-stylesheet href="styles/style.css" type="text/css"/>
    <qti-item-body>
    </qti-item-body>
    <qti-response-processing>
    </qti-response-processing>
    </qti-assessment-item>`;
	var imsroot = new DOMParser().parseFromString(root);
	var imsdoc = imsroot.documentElement;
	var itemBody = imsdoc.getElementsByTagName('qti-item-body')[0];
	var endofResponseDeclaration = imsdoc.getElementsByTagName('endofResponseDeclaration')[0];
	var endofOutcomeDeclaration = imsdoc.getElementsByTagName('endofOutcomeDeclaration')[0];
	var responseProcessing = imsdoc.getElementsByTagName('qti-response-processing')[0];

	var iB = rawxmldoc.getElementsByTagName('item-body')[0];

	var respNdx = 0;
	modifyNode(iB);
	moveChildren(iB, itemBody);

	imsdoc.removeChild(endofResponseDeclaration);
	imsdoc.removeChild(endofOutcomeDeclaration);

	var needMML = type === 'mml';
	return new Promise(function(fulfill, reject) {
		if (needMML) {
			var itemBodyStr = new XMLSerializer().serializeToString(itemBody);
			toMML(itemBodyStr, type).then((result) => {
				var newIB = new DOMParser().parseFromString(result).documentElement;
				itemBody.parentNode.replaceChild(newIB, itemBody);
				fulfill(new XMLSerializer().serializeToString(imsdoc));
			});
		} else {
			fulfill(new XMLSerializer().serializeToString(imsdoc));
		}
	});
};
