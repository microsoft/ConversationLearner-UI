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

GetFile('https://5432-94457606-gh.circle-artifacts.com/0/root/project/results/cypress/Settings%20-%20Settings.19.12.06.01.25.03..018.log')
.then(file => {
  if (file) {
    console.log(file)
  }
})