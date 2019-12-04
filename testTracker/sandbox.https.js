const https = require('https');
//import * as https from 'https'

function GetJson(fileUrl) {
  const options = {
    headers: {
      'Content-Type': 'application/json',
    }
  }
  https.get(fileUrl, options, (resp) => {
    let data = '';

    // A chunk of data has been recieved.
    resp.on('data', (chunk) => {
      data += chunk;
    });

    // The whole response has been received. Print out the result.
    resp.on('end', () => {
      console.log(data)
      //console.log(JSON.parse(data.substring(1,data.length - 1)).path);
    });

  }).on("error", (err) => {
    console.log("Error: " + err.message);
  });
}

GetJson('https://circleci.com/api/v1.1/project/github/microsoft/ConversationLearner-UI/5321/artifacts?circle-token=2ad1e457047948114cb3bbb1957d6f90c1e2ee25')
