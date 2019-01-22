const http = require('http');

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello, World!\n');

  var propertyList = ''
  for(var property in req) propertyList += `${(propertyList.length == 0 ? '' : ', ')}${property}: ${req[property]}`
  console.log(propertyList)
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});