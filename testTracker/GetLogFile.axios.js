const axios = require('axios');

async function GetFile(url) {
  try {
    let artifacts = await axios.get(url).then(response => {
      return response.data;
    })
    .catch(error => {
      console.log(error);
    });
    return artifacts;
  }
  catch(err) {
    console.log(`Error in GetJson: ${err.message}`)
  }
}

GetFile('https://5321-94457606-gh.circle-artifacts.com/0/root/project/results/cypress/API%20Callbacks%20-%20CreateModels.19.11.30.01.22.04..120.log')
.then(file => {
  if (file) {
    console.log(file)
  }
})