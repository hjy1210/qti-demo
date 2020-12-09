# QTI Demo
[QTI(IMS Question & Test Interoperability Specification)](http://www.imsglobal.org/question/index.html) 是線上評量的一種標準，它由[IMS Global Learning Consortium](http://www.imsglobal.org) 所訂定。

QTI 詳細制定試題(assessmentItem)與試卷(assessmentTest)的規範，最新的版本是QTI v2.2。大家遵循這個標準，編寫試題的單位、執行考試的單位、教育單位、與使用考試成績的單位，相互之間的溝通與合作變得輕而易舉。

目前公開軟體的[TAO](https://hub.taocloud.org/) 與 [Moodle](https://moodle.org/)，前者可以用來編寫試題與發佈考試 ，後者可以用來開辦網上學校，後者使用由前者進行考試所獲得的成績，TAO 目前遵循 QTI v2.1。

## assessmentItem
一個試題用一個 ，assessmentItem ，assessmentItem 是 XML 文件的根節點。

根據 [QTI 2.2] (http://www.imsglobal.org/xsd/qti/qtiv2p2/imsqti_v2p2.xsd)，assessmentItem 的屬性中，identifier, title, timeDependent是必須的，子節點由序列的 [responseDeclaration{0,}, outcomeDeclaration{0,}, templateDeclaration{0,}, templateProcessing{0,}, assessmentStimulusRef{0,}, stylesheet{0,}, itemBody{0,}, responseProcessing{0,}, modalFeedback{0,}, apip:apipAccessibility{0,}] 所組成。

responseDeclaration 必須具有屬性 identifier 與 cardinality。子節點由序列 [defaultValue{0,}, correctResponse{0,}, mapping{0,}, areaMapping{0,}] 所組成。

outcomeDeclaration 必須具有屬性 identifier 與 cardinality。子節點由序列 [defaultValue{0,}, 
matchTable/interpolationTable{0,}] 所組成。

itemBody 由 (rubricBlock | positionObjectStage | customInteraction | drawingInteraction | gapMatchInteraction | matchInteraction | graphicGapMatchInteraction | hotspotInteraction | graphicOrderInteraction | selectPointInteraction | graphicAssociateInteraction | sliderInteraction | 
choiceInteraction | mediaInteraction | hottextInteraction | orderInteraction | extendedTextInteraction | uploadInteraction | associateInteraction | feedbackBlock | templateBlock | infoControl | m2:math | m3:math | xi:include | pre | h1 | h2 | h3 | h4 | h5 | h6 | p | address | dl | ol | ul | hr | blockquote | table | div | qh5:article | qh5:aside | qh5:audio | qh5:figure | qh5:footer | qh5:header | qh5:nav | qh5:section | qh5:video)+ 所組成。

responseProcessing 由 (xi:include | responseCondition| responseProcessingFragment | setOutcomeValue | exitResponse | lookupOutcomeValue)+ 所組成。

responseCondition 由序列的 [responseIf{1}, responseElseIf{0,}, responseElse{0,1}] 所組成。

responseIf 與 responseElseIf 都是由一個條件接著 (xi:include | responseCondition| responseProcessingFragment | setOutcomeValue | exitResponse | lookupOutcomeValue)+ 所組成。

responseElse 由 (xi:include | responseCondition| responseProcessingFragment | setOutcomeValue | exitResponse | lookupOutcomeValue)+ 所組成 。

setOutcomeValue 由 (and | gt | not | lt | gte | lte | or | sum | durationLT | durationGTE | subtract | divide | multiple | ordered | customOperator | random | numberIncorrect | numberCorrect | numberPresented | numberResponded | numberSelected | substring | equalRounded | null | delete | match | index | power | equal | contains | containerSize | correct | default | anyN | integerDivide | integerModulus | isNull | member | product | round | truncate | fieldValue | randomInteger | randomFloat | variable | oucomeMinimum | outcomeMaximun | testVariables | integerToFloat | inside | baseValue | patternMatch | mapResponsePoint | mapResponse | stringMatch | repeat | roundTo | lcm | gcd | min | max | mathConstant | statsOperator | mathOperator)+ 等所組成。

## 製作 assessmentItem
QTI 規格中，必須將 assessmentItem 的 xml 檔案以及所有的附件如圖檔、影音檔、stylesheet 以及詳述各元件關聯的imsmanifest.xml 全部壓縮進一個zip檔案，形成所謂的 QTI package。

直接人工編寫 assessmentItem 文件相當困難。因此，先用人工編寫較簡易的 cml 檔案，再透過 cml2item, item2package 程式，將 cml 檔案轉換成 QTI 規格的 xml 檔案，並將題目所需的附件(圖檔/影音檔) 一併壓縮成符合 QTI 規格的 QTI package。

### 編寫 cml 注意事項
編寫 cml 的時候，數學公式與化學反應式用 TeX 的格式編寫，程式透過 mathjax 加以翻譯成 QTI 可以接受的 MathML。然而，cml 是 xml 檔案格式，`<` 與 `&` 是 xml 檔案的特殊字元，數學公式又無法避免的需要使用這兩個符號。因此，TeX 公式中，`<` 必須用 `&lt;` 取代，`&` 必須用 `&amp;` 取代。

### 用 VS Code 編寫 cml
用 VS Code 編寫 cml 的優點

* 雖然 cml 檔案比 assessmentItem 檔案簡易，然而為了便於擴充，編寫的時候要打的字相當多。VS Code 可以將經常使用的段落定義成片語(snippet)再用關鍵詞快速輸入。事實上，可以用關鍵詞定義各種題型的題殼，之後再填補題目的實際內容。
* VS Code 可以將 cml 檔案格式化，有助於了解整個 cml 檔案的結構。


## 工具
### xmldom
用 xmldom 解析/製作 xml/html 檔案的內容。xmldom在執行時，DOM 隨時更新，因此若有增刪動作時要特別注意先後順序。
### archiver/adm-zip
用 archiver/adm-zip 進行檔案的壓縮與解壓縮。
### mathjax-node
用 mathjax-node 將 TeX 內容轉成 MathML。

用 mathjax-node 翻譯 TeX 為 MathML 的時候，有些化學式子會出現些微的瑕疵，不符合 QTI2 的規格。
例如，`sat2_chm_2016_14.xml，mpadded > voffset=".??em"` 要取消。`sat2_chm_2016_11.xml，mpadded > mspace` 裡的 `negativethinmathspace` 要改成 `0em`，`height="0"` 要改成 `height="0em"` `depth="0"` 要改成  `depth="0em"`。

mathjax-node 要使用mhchem3，可以用下列設定。
```   
    mjAPI.config({
      MathJax: {
        extensions: ["TeX/mhchem.js"],
        TeX: {
          Macros: { ceec: ['{\\fbox{#1}}', 1] },
          mhchem:{legacy:false}
        }
      }
    });
```
### Vue
gapMatchVueComponent.html 製作了一個 Vue component，<gapmatch-component>。
gapmatch-component 利用 slot 將整個 gapMatchInteraction 的內容放在裡面，使用時，只要傳遞 childgaps 與 gapindexes 兩個參數進去就可以了，比目前在 package2htmlVue.js 裡面使用的方法還要輕便許多。

eventHandleParameters.html 用來了解事件發生時參數如何傳遞，用 addEventListener
似乎比較不會受到到底this指的是甚麼的困擾。

### object
QTI 2.1 接受 object 而不支援 audio/video，object  的正確語法為 
```
<object type="audio/mpeg" height="50" data="audios/example1.mp3">
  <param name="autoplay" value="false" />
</object>
```
可惜 chrome 
  載入 object 後必定自動播放。[etavener/qti-player](https://github.com/etavener/qti-player) 示範了在 QTI-xml 裡面用 `<object>`，但實作網頁的時候用 `<audio>/<video>`取代之，見[T003](http://www.ewantavener.co.uk/demo/qti-player/app/index.html?id=T003)。QTI 2.2 接受 audio/video。QTI 目前仍不接受 `<svg>`。



### adm-zip
zip 10_11.png(26kB) corrupted!

## archiver 
zip 10_11.png(26kB),1A.png(45kB) OK!
archiver zip file asyncally.

### package2html

* xmldom 的 removeAttribute("xmlns") 無法將 xmlns 屬性去除，必須用setAttribute("xmlns","")

* 原來的package2html.js搭配qtidisplay.js，在一個網頁有兩個gapMatchInteraction的時候會互相衝突。
* 改用package2htmlVue.js，因為script都封裝在元件內，同一個網頁不管有幾個gapMatchInteraction都可以運作。
 * 用package2htmlJs.js搭配qtidisplayJs.js，負擔較輕。

### QTI 3.0
[QTI 3.0](https://www.imsglobal.org/spec/qti/v3p0/impl/) 支援 video, audio。

QTI 3.0 的標記名稱全部改成小寫。

MathJax-Node 搭配 MathJax2，而 MathJax@3 node application 的示範在[MathJax-demos-node](https://github.com/mathjax/MathJax-demos-node)，tex2mml-page 會把標記名稱全部改成小寫。

開始寫 cml2json30.js，目的要搭配 MathJax@3 與 QTI3.0。

用 [qtiv3-examples simple.zip](https://github.com/IMSGlobal/qti-examples/blob/master/qtiv3-examples/packaging/simple/simple.zip) 測試得知 Tao Tub 不支援 QTI3.0。

* [qti-choice-interaction](https://www.imsglobal.org/spec/qti/v3p0/impl#h.j9nu1oa1tu3b)
* [qti-gap-match-interaction](https://www.imsglobal.org/spec/qti/v3p0/impl#h.7sroqk3xl8e1)
* [qti-inline-choice-interaction](https://www.imsglobal.org/spec/qti/v3p0/impl#h.8zaq47h31112)
* [ Composite Items](https://www.imsglobal.org/spec/qti/v3p0/impl#h.fzolwwxsh7ga)
* [qti-product,...](https://www.imsglobal.org/sites/default/files/spec/qti/v3/info/index.html#AbstractAttribute_NumericExpressionGroup_qti-product)

## cml2json30
執行

`node scripts\cml2json30.js sat2_phy_2016_21.cml`

可產生 sat2_phy_2016_21.xml,sat2_phy_2016_21.zip,sat2_phy_2016_21.json

過程如下：

1. 利用 cml2item30 的 cml2item 將 cml 檔案轉成 qti-assessment-item 檔案 
2. 利用 item2package30 將 qti-assessment-item 檔案連同所需的資源檔案包裝成 zip檔
3. 利用 package2json30 從 zip 檔案取得資料存成所需的json檔，json檔案的內容有考試時需要的stylecontent,html，也有評分時要用到的responseInfo,outcomeInfo, responseProcessing。

### cml2item30
cml2xml30 裡面的 toMML 函數，是個promise， 利用 MathJax@3 的 MathJax 製作，將含有tex公式的html字串轉成mathmml 標記。

cml2item30 裡面的 cml2item 函數，是個promise，
1. 先將 cml 檔案的內容轉成qti-assessment-item格式，其中
    * qti-choice-interaction 用 manipulateChoiceInteraction 
    * qti-inline-choice-interaction 用 manipulateInlineChoiceInteraction
    * qti-group-inline-choice-interaction 用 manipulateGroupInlineChoiceInteraction
    * qti-gap-match-interaction 用 manipulateGapMatchInteraction
1. 再利用 toMML 將 cml 檔案裏面的tex數學公式轉成 mathmml 標記。

cml2json30 利用cml2item，存檔 qti-assessment-item 的 xml 檔案。

### item2package30
item2package30 裡面的 item2package 是個 promise。
1. 用 qti-assessment-item 的 xml 檔案的資訊製作 imsmanifest.xml，連同所需的資源檔案包裝成zip 檔。

### package2json30
1. package2json30 裡面的 package2json 從 zip 檔案裡面取出 item 的 itemStr字串
2. package2json30 裡面的 getInfo 函數，由 itemStr字串與 zip 檔案產生 itemInfo。 
   itemInfo 是 json object，由 identifier, responseInfo, outcomeInfo, responseProcessing, stylecontent 所組成。 
3. itemStr 轉成 itemDoc
4. itemDoc 裡面的 itemBody 轉換成 html 格式
    * replaceChoiceInteractions 轉換 qti-choice-interaction
    * replaceInlineChoiceInteractions 轉換 qti-inline-choice-interaction
    * replaceGapMatchInteractions 轉換 qti-gap-match-interaction
    * replaceImages 將圖形檔案內容轉成base64文字格式
    * replaceAudios 將audio檔案內容轉成base64文字格式
5. itemBody 的html格式，併入 itemInfo.html
6. itemInfo 裡面的 html, stylecontent 考試時使用，其它評分時使用。
