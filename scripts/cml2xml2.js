var DOMParser = require('xmldom').DOMParser
var XMLSerializer = require('xmldom').XMLSerializer

///// mathjax-node promise version
module.exports = function toMML(data) {
  var res = []
  // replace inline-Tex(delimited by \( and \)) by <mathjax-node class="inline">
  // replace Tex(delimited by \[ and \]) by <mathjax-node class="block">
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

  // promises is arrange array of Promises, each entry Promise corresponding to 
  // typesetting one chunk of <mathjax-node>
  var promises = []
  var mathjaxs = docEle.getElementsByTagName('mathjax-node')
  for (var j = mathjaxs.length - 1; j >= 0; j--) {
    const mathnode = mathjaxs[j]
    var isInline = mathnode.getAttribute('class') === "inline"
    var options = {
      math: mathnode.childNodes[0].nodeValue,
      format: "TeX", // "inline-TeX", "MathML"
      mml: true, //  svg:true,
    }
    if (isInline) {
      options.format = "inline-TeX"
    }
    promises.push(mjAPI.typeset(options)
      .then((data) => {
        mathnode.parentNode.replaceChild(new DOMParser().parseFromString(data.mml).documentElement,
          mathnode)
      })
      .catch(err => { throw new Error(err) })
    )
  }

  return new Promise((resolve, reject) => {
    Promise.all(promises).then(results => {
      resolve(new XMLSerializer().serializeToString(docEle))
    })
  })
}

/*var cmlStr = `<itemBody>Solution of equation \\(ax^2+bx+c=0\\) is
\\[x=\\frac{-b\\pm\\sqrt{b^2-4ac}}{2a}.\\] Molecular formula of sulfuric acid is
\\(\\ce{H2SO4}\\).</itemBody>`

toMML(cmlStr).then(result=>console.log(result))*/
