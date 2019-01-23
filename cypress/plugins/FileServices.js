const http = require('http');
const url = require('url');  // Needed to do: 'npm install -s url'
const fs = require('fs')

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((request, response) => {
  debugger;

  if (request.method == 'GET') GetServices(request, response)
  else if (request.method == 'PUT') PutServices(request, response)
  else
  {
    response.statusCode = 405; // Method Not Allowed
    response.setHeader('Allow', 'GET, POST');
    response.setHeader('Content-Type', 'text/plain');
    response.end();
  }
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});


function GetServices(request, response) {
  var parsed = url.parse(request.url);
  var {pathname, query} = parsed;

  if (pathname == '/') {
    response.statusCode = 200;
    response.setHeader('Content-Type', 'text/plain');
    response.end('FileServices at your service.\n');
  }
  else if (pathname != '/read') {
    response.statusCode = 400;
    response.end();
  }
  else {
    if (!query.startsWith('file='))
    {
      response.statusCode = 400;
      response.end();
    }
    else {
      var fileName = query.substring(5)
      fs.readFile(fileName, (error, fileContents) => {
        if (error) throw error;

        response.statusCode = 200;
        response.setHeader('Content-Type', 'text/plain');
        //response.setHeader('Access-Control-Allow-Origin', '*');
        response.write(fileContents)
        response.end();
      });
    }
  }
}


function PutServices(request, response) {
  var parsed = url.parse(request.url);
  var {pathname, query} = parsed;

  if (pathname != '/write') {
    response.statusCode = 400;
    response.end();
  }
  else {
    if (!query.startsWith('file='))
    {
      response.statusCode = 400;
      response.end();
    }
    else {
      var fileName = query.substring(5)

      var body = [];
      request.on('error', (err) => {
        console.error(err);
      }).on('data', (chunk) => {
        body.push(chunk);
      }).on('end', () => {
        body = Buffer.concat(body).toString();
      });

      fs.writeFile(fileName, body, (error) => {
        if (error) throw error;
        console.log('File Written')
      });

      response.statusCode = 200;
      response.setHeader('Content-Type', 'text/plain');
      response.end();
    }
  }
}
