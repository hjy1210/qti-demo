In root directory, execute `node scripts/item2package sat2_chi_2016_01.xml`
to produce sat2\_chi\_2016_01.zip for upload to TAO or Qtiworks.

In root directory, execute `node scripts/package2html sat2_chi_2016_01.zip`
to produce `sat2_chi_2016_01.html` for display item.

## raw2item

* <variable identifier="SCORE"> 會產生下列的訊息，理由是variable element 沒有關閉，因此必須改成<variable identifier="SCORE"/>
"[xmldom warning]        unclosed xml attribute"

* 在cml檔案中，實質內容中若有"<" 應該打成"&lt;"。

## xmldom
xmldom在執行時，node 隨時更新，因此若用足碼處理時必須由後往前處理(i--)。

## adm-zip
zip 10_11.png(26kB) corrupted!

## archiver 
zip 10_11.png(26kB),1A.png(45kB) OK!
archiver zip file asyncally.

## package2html
* 將itemBody.replaceChild 改成 inlineChoiceInteractions[i].parentNode.replaceChild
* 增加replaceAudios
* object 的正確語法如下
```
        <object type="audio/mpeg" height="50" data="audios/example1.mp3">
          <param name="autoplay" value="false" />
        </object>
```
在Chrome與Edge中，autoplay=false 無效，網頁一開馬上播放因黨，IE上則OK。所以應該用audio而非object，可惜QTI2.1只允許object,不予許audio。
* xmldom 的 removeAttribute("xmlns") 無法將 xmlns 屬性去除，必須用setAttribute("xmlns","")

QTI2.2支援audio,video。

## raw2item
將選填題的groupInlineChoiceInteraction翻譯時，每個inlineChoiceInteraction前面增加\ceec{n}

## mathjax-node
用mathjax-node翻譯latex為mathml的時候，有些化學式子會出現些微的瑕疵，不符合QTI2的規格。
例如，sat2_chm_2016_14.xml，mpadded > voffset=".??em" 要取消。sat2_chm_2016_11.xml，mpadded > mspace 裡的 negativethinmathspace 要改成0em，height="0"要改成height="0em" depth="0" 要改成  depth="0em"

QTI 目前仍不接受 `<svg>`