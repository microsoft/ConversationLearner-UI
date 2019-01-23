const http = require('http');

var done = false
http.get('http://127.0.0.1:3000/read?file=./cypress/TestList.js', response =>
{
  var fileContents = [];

  response.on('error', (err) => {
    console.error(`Error: ${err}`);
  }).on('data', (chunk) => {
    console.log(`got a chunk`)
    fileContents.push(chunk);
  }).on('end', () => {
    console.log(`Length: ${fileContents.length}`)
    fileContents = Buffer.concat(fileContents).toString();
    done = true;
  });
  
  setTimeout(() => {
    console.log(`File Contents: ${fileContents}`)
  }, 1000)
});

while (!done) yield();
console.log('The End!')
