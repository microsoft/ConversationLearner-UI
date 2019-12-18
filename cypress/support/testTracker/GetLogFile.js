const https = require('https');
//import * as https from 'https'

function GetFile(fileUrl) {
  https.get(fileUrl, (resp) => {
    let data = '';

    // A chunk of data has been recieved.
    resp.on('data', (chunk) => {
      data += chunk;
    });

    // The whole response has been received. Print out the result.
    resp.on('end', () => {
      console.log(data);
    });

  }).on("error", (err) => {
    console.log("Error: " + err.message);
  });
}

GetFile('https://5321-94457606-gh.circle-artifacts.com/0/root/project/results/cypress/API%20Callbacks%20-%20CreateModels.19.11.30.01.22.04..120.log')
