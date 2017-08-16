var JSZip = require("jszip");
var fs=require("fs")
var zip = new JSZip();
var files=["sat2_chi_2016_01.xml","imsmanifest.xml","styles/style.css"]
var data
for (var i=0;i<files.length;i++){
  data= fs.readFileSync(files[i],encoding="utf-8");
  zip.file(files[i],data)
}
///// zip file created by following method are bigger than usual,
///// TAO accept it, but QtiWorks denied it.
///// In nodezip.js, we use node-zip which is on top of jszip, we can 
///// create zip in usual size and accepted by both TAO and QtiWorks.
zip
.generateNodeStream({type:'nodebuffer',streamFiles:true})
.pipe(fs.createWriteStream('out.zip'))
.on('finish', function () {
    // JSZip generates a readable stream with a "end" event,
    // but is piped here in a writable stream which emits a "finish" event.
    console.log("out.zip written.");
});