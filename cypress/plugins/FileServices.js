const http = require('http');
const url = require('url')  // Needed to do: 'npm install -s url'

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello, World!\n');

  var propertyList = ''
  //for(var property in req) propertyList += `${(propertyList.length == 0 ? '' : ', ')}${property}: ${req[property]}`
  //console.log(req)//propertyList)
  console.log(req.url)
  console.log(req.method)
  console.log(url.parse(req.url))
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});