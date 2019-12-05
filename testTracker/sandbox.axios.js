const axios = require('axios');

async function GetJson(url) {
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

GetJson('https://circleci.com/api/v1.1/project/github/microsoft/ConversationLearner-UI/5390/artifacts?circle-token=2ad1e457047948114cb3bbb1957d6f90c1e2ee25')
.then(artifacts => {
  artifacts.forEach(artifact => {
    console.log(artifact.url);
    console.log('');
    console.log(artifact.path);
    console.log('');
    console.log('');
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