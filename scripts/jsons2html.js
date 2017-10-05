var DOMParser = require('xmldom').DOMParser
var XMLSerializer = require('xmldom').XMLSerializer
var fs=require('fs')
module.exports=function jsons2html(jsons){
  var i,j,j,styleContent,identifier,div,divContent
  var identifiers=[]
  var testInfo={}
  for (i=0;i<jsons.length;i++){
    identifier=`qti_item_${i+1}`
    identifiers.push(identifier)
    testInfo[identifier]={responseInfo:jsons[i].responseInfo,
      styleContent:jsons[i].styleContent,html:jsons[i].html}
    //for (var name in jsons[i].responseInfo){
    //  jsons[i].responseInfo[name]=""
    //}
  }
  divContent=""
  styleContent=""
  for (i=0;i<jsons.length;i++){
  //console.log(new XMLSerializer().serializeToString(div))
    identifier=identifiers[i]
    styleContent += testInfo[identifier].styleContent.replace(/[^}]*?{/g, x => `#${identifier} ${x}`)+"\n"
    div=testInfo[identifier].html
    divnode=new DOMParser().parseFromString(div).documentElement
    ////////// find all element with attribute name, prepend identifier+"_"
    //var elements=divnode.querySelectorAll("*[name]")
    //for (j=0;j<elements.length;j++) elements[j].setAttribute('name',identifier+"_"+elements[j].getAttribute("name"))
    divnode.setAttribute("id",identifier)
    divContent+=new XMLSerializer().serializeToString(divnode)+"\n"
  }
  for (var id in testInfo){
    testInfo[id]["styleContent"]=""
    testInfo[id]["html"]=""
    for (var name in testInfo[id].responseInfo){
      testInfo[id].responseInfo[name]=""
    }

  }
  var testInfoStr=JSON.stringify(testInfo,null,2)
  //fs.writeFileSync("testInfo.json",testInfoStr)
  //console.log(testInfoStr)
  var html=`
    <html>
      <head>
        <meta charset="UTF-8" />
        <script type="text/x-mathjax-config">
          MathJax.Ajax.config.path["mhchem"] =  "https://cdnjs.cloudflare.com/ajax/libs/mathjax-mhchem/3.2.0";
          MathJax.Hub.Config({
            extensions: ["[mhchem]/mhchem.js"],
            TeX: {
              Macros: {
              ceec: ["{\\\\fbox{#1 }}", 1],
              ceece: ["\\\\underline{\  {\\\\fbox{#1 }}\  }", 1]
              }
            }
          });
        </script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.1/MathJax.js?config=TeX-AMS-MML_HTMLorMML"></script>
        <link rel="stylesheet" type="text/css" href= "scripts/qtidisplay.css" />
        <style>${styleContent}</style>
      </head>
      <body>
        ${divContent}
        <script>
          var testInfo=${testInfoStr}
        </script>
        <script src="scripts/qticlient.js"></script>
        <p><button onclick="getAllResponse()">Get Response</button>
        </p>
      </body>
    </html>
    `
   //fs.writeFileSync("test.html", html, "utf-8")
   return html
}
