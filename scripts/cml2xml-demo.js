var DOMParser = require('xmldom').DOMParser
var XMLSerializer = require('xmldom').XMLSerializer

/*var data = `<p>方程式 \\(ax^2+bx+c=0\\) 的解為
\\[x=\\frac{-b\\pm\\sqrt{b^2-4ac}}{2a}\\] 硫酸的分子式為
\\(\\ce{H2SO4}\\)。</p>`*/
//console.log(data)
module.exports=function toMML(data) {
  var res = []
  var str = data.replace(/(\\\([^<]*?\\\)|\\\[[^<]*?\\\])/g, m => {
    if (m[1] === "(") {
      return `<mathjax-node class="inline">${m.substr(2, m.length - 4)}</mathjax-node>`
    } else {
      return `<mathjax-node class="block">${m.substr(2, m.length - 4)}</mathjax-node>`
    }
  })
  var mjAPI = require("mathjax-node");
  mjAPI.config({
    MathJax: {
      TeX: {
        Macros: { ceec: ['{\\fbox{#1}}', 1] }
      }
    }
  });
  mjAPI.start();

  var doc = new DOMParser().parseFromString(str)
  var docEle = doc.documentElement
  var promises = []
  var mathjaxs = docEle.getElementsByTagName('mathjax-node')
  for (var j = mathjaxs.length - 1; j >= 0; j--) {
    const i = j;
    var promise = new Promise((resolve, reject) => {
      var isInline = mathjaxs[i].getAttribute('class') === "inline"
      var options = {
        math: mathjaxs[i].childNodes[0].nodeValue,
        format: "TeX", // "inline-TeX", "MathML"
        mml: true, //  svg:true,
      }
      if (isInline) {
        options.format = "inline-TeX"
      }
      mjAPI.typeset(options, (data) => {
        if (data.errors) {
          reject(data.errors)
        } else {
          mathjaxs[i].parentNode.replaceChild(new DOMParser().parseFromString(data.mml).documentElement,
            mathjaxs[i])
          resolve(data.mml)
        }
      })
    })
    promises.push(promise)
  }
  return new Promise((resolve,reject)=>{
    Promise.all(promises).then(results => {
      resolve(new XMLSerializer().serializeToString(docEle))
    })
  
  })
  //Promise.all(promises).then(results => {
  //  console.log(new XMLSerializer().serializeToString(docEle))
  //})
}

//toMML(data).then(result=>console.log(result))