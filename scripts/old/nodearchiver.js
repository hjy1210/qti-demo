// require modules
var fs = require('fs');
var archiver = require('archiver');

// create a file to stream archive data to.
var output = fs.createWriteStream('example.zip');
var archive = archiver('zip', {
    zlib: { level: 9 } // Sets the compression level.
});

// listen for all archive data to be written
output.on('close', function() {
  console.log(archive.pointer() + ' total bytes');
  console.log('archiver has been finalized and the output file descriptor has closed.');
});

// good practice to catch warnings (ie stat failures and other non-blocking errors)
archive.on('warning', function(err) {
  if (err.code === 'ENOENT') {
      // log warning
  } else {
      // throw error
      throw err;
  }
});

// good practice to catch this error explicitly
archive.on('error', function(err) {
  throw err;
});

// pipe archive data to the file
archive.pipe(output);

var files=["sat2_chi_2016_01.xml","imsmanifest.xml","styles/style.css"]
for (var i=0;i<files.length;i++){
  archive.append(fs.createReadStream(files[i]), { name: files[i] });
}
// finalize the archive (ie we are done appending files but streams have to finish yet)
archive.finalize();