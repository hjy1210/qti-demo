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

## raw2item
將選填題的groupInlineChoiceInteraction翻譯時，每個inlineChoiceInteraction前面增加\ceec{n}