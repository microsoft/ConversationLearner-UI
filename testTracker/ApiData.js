const axios = require('axios')

exports.Get = Get

async function Get(url) {
  return await axios.get(url).then(response => {
    return response.data
  })
  .catch(err => {
    console.log(`GetApiData - Error accessing: ${url}`)
    console.log(err.message)
  })
}

// UNIT TESTS - These are triggered ONLY when running this as a standalone module.
if (require.main === module) {
  (async function() {
    let buildNumber = process.argv[2]
    if (!buildNumber) {
      buildNumber = 5501
    }

    const artifacts = await Get(`https://circleci.com/api/v1.1/project/github/microsoft/ConversationLearner-UI/${buildNumber}/artifacts?circle-token=2ad1e457047948114cb3bbb1957d6f90c1e2ee25`)
    console.log(artifacts)
  }())
}