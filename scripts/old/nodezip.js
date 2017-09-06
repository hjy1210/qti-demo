///// In nodearchiver.js, we use archiver to generate zip file, archiver is much quick than node-zip.
var JSZip = require("node-zip");
var fs=require("fs")
var zip = new JSZip();
var files=["sat2_chi_2016_01.xml","imsmanifest.xml","styles/style.css"]
var data
for (var i=0;i<files.length;i++){
  data= fs.readFileSync(files[i],encoding="utf-8");
  zip.file(files[i],data)
}
data=zip.generate({base64:false,compression:'DEFLATE'});
fs.writeFileSync('test.zip', data, 'binary');
console.log('test.zip done')
