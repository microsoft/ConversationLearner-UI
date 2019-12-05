const axios = require('axios');

async function GetApiData(url) {
  let data = await axios.get(url).then(response => {
    return response.data;
  })
  .catch(err => {
    console.log(`GetApiData - Error accessing: ${url}`)
    console.log(err.message);
  });
  return data;
}

const buildNumber = 5390
let logs = []
let mp4s = []
let pngs = []

let iStart
let iEnd
let iSpec
let key

GetApiData(`https://circleci.com/api/v1.1/project/github/microsoft/ConversationLearner-UI/${buildNumber}/artifacts?circle-token=2ad1e457047948114cb3bbb1957d6f90c1e2ee25`)
  .then(artifacts => {
    artifacts.forEach(artifact => {
      const suffix = artifact.url.substring(artifact.url.length - 3)
      switch (suffix) {
        case 'log':
            iStart = artifact.url.indexOf('/cypress/') + '/cypress/'.length
            iEnd = artifact.url.length - '.19.12.05.02.42.14..456.log'.length
            key = artifact.url.substring(iStart, iEnd).replace(/\/|\\/g, "-")
            console.log(key)
            console.log(artifact.url)
            logs.push({ key: key, url: artifact.url })
          break;

        case 'mp4':
            iStart = artifact.url.indexOf('/videos/') + '/videos/'.length
            iEnd = artifact.url.length - 4
            key = artifact.url.substring(iStart, iEnd).replace(/\/|\\/g, "-")
            console.log(key)
            console.log(artifact.url)
            mp4s.push({ key: key, url: artifact.url })
          break;
        
        case 'png':
          iStart = artifact.url.indexOf('/screenshots/') + '/screenshots/'.length
          iSpec = artifact.url.indexOf('.spec.', iStart)
          iEnd = artifact.url.indexOf('/', iSpec)
          key = artifact.url.substring(iStart, iEnd).replace(/\/|\\/g, "-")
          console.log(key)
          console.log(artifact.url)
          pngs.push({ key: key, url: artifact.url })
          break;
        
        default:
          break;
      }
    });
  }, err => {
    console.log(`Error: ${err.message}`)
  })
  .catch(err => {
    console.log(`.then Error: ${err.message}`)
  });


/*
.xml - skip
.log
.mp4
.png - these tell us which tests failed
*/