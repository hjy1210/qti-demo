var mjAPI = require("mathjax-node");

mjAPI.config({
  MathJax: {
    extensions: ["mhchem.js"]
  }
});
mjAPI.start();

var options = {
  math: "\\pu{1.0e-20}",
  format: "inline-TeX", // "inline-TeX", "MathML"
  mml: true, //  svg:true,
}

mjAPI.typeset(options, (data) => {
  if (data.errors) {
    console.log(data.errors)
  } else {
    console.log(data.mml)
  }
})

