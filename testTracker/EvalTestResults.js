const axios = require('axios')

async function GetApiData(url) {
  let data = await axios.get(url).then(response => {
    return response.data
  })
  .catch(err => {
    console.log(`GetApiData - Error accessing: ${url}`)
    console.log(err.message)
  })
  return data
}

(async function() {

  const buildNumber = 5390
  let logs = []
  let mp4s = []
  let pngs = []
  let unknownTestFailures = []
  let knownTestFailures = []
  let passingTests = []
  let errors = []

  let iStart
  let iEnd
  let iSpec
  let testName
  let key

  const artifacts = await GetApiData(`https://circleci.com/api/v1.1/project/github/microsoft/ConversationLearner-UI/${buildNumber}/artifacts?circle-token=2ad1e457047948114cb3bbb1957d6f90c1e2ee25`)
  MoveArtifactJsonIntoArrays()
  ProcessFailingTestArtifacts()
  ProcessPassingTestArtifacts()
  RenderResults()

  function MoveArtifactJsonIntoArrays() {
    artifacts.forEach(artifact => {
      const suffix = artifact.url.substring(artifact.url.length - 3)
      switch (suffix) {
        case 'log':
            iStart = artifact.url.indexOf('/cypress/') + '/cypress/'.length
            iEnd = artifact.url.length - '.19.12.05.02.42.14..456.log'.length
            key = artifact.url.substring(iStart, iEnd)
            console.log(key)
            console.log(artifact.url)
            logs.push({ key: key, url: artifact.url })
          break

        case 'mp4':
            iStart = artifact.url.indexOf('/videos/') + '/videos/'.length
            iEnd = artifact.url.length - 4
            testName = artifact.url.substring(iStart, iEnd)
            key = testName.replace(/\/|\\/g, "-")
            console.log(testName)
            console.log(key)
            console.log(artifact.url)
            mp4s.push({ testName: testName, key: key, url: artifact.url })
          break
        
        case 'png':
          iStart = artifact.url.indexOf('/screenshots/') + '/screenshots/'.length
          iSpec = artifact.url.indexOf('.spec.', iStart)
          iEnd = artifact.url.indexOf('/', iSpec)
          testName = artifact.url.substring(iStart, iEnd)
          key = testName.replace(/\/|\\/g, "-")
          console.log(testName)
          console.log(key)
          console.log(artifact.url)
          pngs.push({ testName: testName, key: key, url: artifact.url })
          break
        
        default:
          break
      }
    })
  }

  function ProcessFailingTestArtifacts() {
    pngs.forEach(png => {
      let error
      let failureDetails

      const log = logs.find(log => log.key === png.key)
      if (!log) {
        errors.push({ testName: png.testName, key: png.key, url: 'page error: Log file not found' })
        return
      }
      failureDetails = GetTriageDetailsAboutTestFailure(log)

      const mp4 = mp4s.find(mp4 => mp4.key === png.key)
      if (!mp4) {
        errors.push({ testName: png.testName, key: png.key, url: 'page error: mp4 file not found' })
        return
      }

      let testFailure = {
        testName: png.testName,
        key: png.key,
        snapshotUrl: png.url,
        videoUrl: mp4.url,
        logUrl: log.url,
      }

      if (typeof failureDetails == 'string') {
        testFailure.failureMessage = failureDetails
        unknownTestFailures.push(testFailure)
      } else {
        testFailure.failureMessage = failureDetails.message
        testFailure.bugs = failureDetails.bugs
        knownTestFailures.push(testFailure)
      }
    })
  }

  const triageData = [
    { 
      and: [
        "Timed out retrying: Expected to find content: 'z-rename-",
        "within the element: <div.css-69> but never did.",
      ],
      bugs: [2407],
    },
    {
      and: [`CypressError: Timed out retrying: Expected to find element: '[data-testid="app-index-model-name"]', but never found it.`],
      bugs: [2408],
    }
  ]

  function GetTriageDetailsAboutTestFailure(log) {
    GetApiData(log.url).then(logText => {
      const search = '\nFailure Message: '
      let failureMessage
      
      let i = logText.lastIndexOf(search)
      if (i == -1) {
        failureMessage = 'ERROR: Failure Message was not found in this log file.'
      } else {
        failureMessage = logText.substring(i + search.length)
      }


    })
  }

  function ProcessPassingTestArtifacts() {
    logs.forEach(log => {
      if (unknownTestFailures.findIndex(failure => failure.key === log.key) >= 0) return
      if (knownTestFailures.findIndex(failure => failure.key === log.key) >= 0) return

      const mp4 = mp4s.find(mp4 => mp4.key === png.key)
      if (!mp4) {
        errors.push({ testName: png.testName, key: png.key, url: 'page error: mp4 file not found' })
        return
      }

      passingTests.push({
        testName: mp4.testName,
        videoUrl: mp4.url,
        logUrl: log.url,
      })
    })
  }

  function RenderResults() {
    console.log('UNKNOWN TEST FAILURES -------------------------------------------------------')
    unknownTestFailures.forEach(unknownTestFailure => {
      console.log(`unknownTestFailures.push({
        testName: '${unknownTestFailures.testName}',
        key: ${unknownTestFailures.key},
        snapshotUrl: '${unknownTestFailures.snapshotUrl}',
        videoUrl: '${unknownTestFailures.videoUrl}',
        logUrl: '${unknownTestFailures.logUrl}',
        failureMessage: '${unknownTestFailures.failureMessage}',
      })`)
    })

    console.log('KNOWN TEST FAILURES ---------------------------------------------------------')
    knownTestFailures.forEach(knownTestFailure => {
      console.log(`unknownTestFailures.push({
        testName: '${knownTestFailure.testName}',
        key: ${knownTestFailure.key},
        snapshotUrl: '${knownTestFailure.snapshotUrl}',
        videoUrl: '${knownTestFailure.videoUrl}',
        logUrl: '${knownTestFailure.logUrl}',
        failureMessage: '${knownTestFailure.failureMessage}',
        bugs: '${knownTestFailures.bugs}',
      })`)
    })

    console.log('PASSING TESTS ---------------------------------------------------------------')
    passingTests.forEach(passingTest => {
      console.log(`passingTests.push({
        testName: '${passingTest.testName}',
        videoUrl: '${passingTest.videoUrl}',
        logUrl: '${passingTest.logUrl}',
      })`)
    })
  }


}())

/*
.xml - skip
.log
.mp4
.png - these tell us which tests failed
*/