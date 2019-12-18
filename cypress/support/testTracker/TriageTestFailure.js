const apiData = require('./ApiData')
const cheerio = require('cheerio')

const FAILURE_MESSAGE = 'fm'
const ERROR_PANEL = 'ep'
const FULL_LOG = 'fl'

var triageData = undefined

exports.SetTriageData = SetTriageData
exports.GetTriageDetailsAboutTestFailure = GetTriageDetailsAboutTestFailure

function SetTriageData(data) {
  triageData = data
}

async function GetTriageDetailsAboutTestFailure(log) {
  if (!triageData) {
    throw new Error('You must first call "SetTriageData()" before calling GetTriageDetailsAboutTestFailure')
  }

  let failureMessage
  let errorPanelText
  let fullLogText

  // Relevant items in queryObj are:
  //  searchBy: 'string' - must be one of: FAILURE_MESSAGE, ERROR_PANEL, FULL_LOG
  //  and: 'array' - must contain either strings used in the search or another queryObj
  //  or: 'array' - must contain either strings used in the search or another queryObj
  // It should contain only an 'and' array or an 'or' array, but not both.
  function query(queryObj, defaultSearchBy = FAILURE_MESSAGE) {
    // Wrapping the actual call so we can log the returned value with greater ease.
    let returnValue = _query()
    console.log(`query returned:`, returnValue, '\n')
    return returnValue
    
    function _query() {
      // Determine which string will be searched...
      let searchBy = defaultSearchBy
      if (queryObj.searchBy) {
        searchBy = queryObj.searchBy  
      }
      let sourceText
      switch(searchBy) {
        case FAILURE_MESSAGE:
          sourceText = failureMessage
          break;
        case ERROR_PANEL:
          sourceText = errorPanelText
          break;
        case FULL_LOG:
          sourceText = fullLogText
          break;
        default:
          throw new Error(`Unexpected searchBy value: '${searchBy}'`)
      }
      
      if (!sourceText) {
        console.log(`sourceText for searchBy '${searchBy}' is undefined`)
        return false
      }
      //console.log(`sourceText: >>>${sourceText.substring(0, 140)}<<<`)

      // Determine whether multiple conditions will be ANDed or ORed together to form the result...
      let and
      let queryArray
      if(queryObj.and) {
        and = true
        queryArray = queryObj.and
      } else if(queryObj.or) {
        and = false
        queryArray = queryObj.or
      }
      
      console.log(`query`, searchBy, and ? 'AND' : 'OR', queryArray)

      // Do the actual search here...
      let result
      for (let i = 0; i < queryArray.length; i++) {
        item = queryArray[i]
        console.log(`item:`, item)
        if (typeof item == 'string') {
          result = sourceText.includes(item)
          console.log(`string search`, result)
        } else if (typeof item == 'object') {
          result = query(item, searchBy)
          console.log(`object search`, result)
        } else {
          throw new Error(`Unexpected item type in Query Array: ${typeof item}`)
        }
        
        if (and) { 
          if (!result) { return false }
        } else { // this is an 'OR' test
          if (result) { return true }
        }
      }
      return and
    }
  }
  
  function GetFailureMessage() {
    const searchForFailureMessage = '\nFailure Message: '
    let iStart
    if (log.key.endsWith('.spec.ts')) {
      // The .ts tests usually have multiple errors in them, so we search from the beginning
      // in order to find the first failure, which usually causes the other failures.
      iStart = fullLogText.indexOf(searchForFailureMessage)
    } else {
      iStart = fullLogText.lastIndexOf(searchForFailureMessage)
    }
    if (iStart == -1) {
      console.log(`GetTriageDetailsAboutTestFailure - not found error`)
      return 'ERROR: Failure Message was not found in this log file.'
    } else {
      iStart += searchForFailureMessage.length

      let iEnd
      let iEnd1 = fullLogText.indexOf('\n-+-', iStart)
      let iEnd2 = fullLogText.indexOf('\n***', iStart)
      if (iEnd1 == -1 && iEnd2 == -1) {
        iEnd = fullLogText.length
      } else {
        iEnd = Math.min(iEnd1, iEnd2)
      }

      return fullLogText.substring(iStart, iEnd)
    }
  }

  function GetErrorPanelText() {
    const errorPanelMarker = 'Error Panel found in Current HTML'
    const index = fullLogText.indexOf(errorPanelMarker)
    if (index == -1) { return undefined }
  
    let start = fullLogText.indexOf('\n', index + errorPanelMarker.length) + 6
    let end = fullLogText.indexOf('\n-+- ', start)
    let errorMessage = fullLogText.substring(start, end).trim()
  
    console.log(`start: ${start} - end: ${end}`)
    console.log('Extracted:\n' + errorMessage + '\n')
  
    // Adding spaces to the end of each potential text string just to be sure there is a break between words.
    // Later we will remove any extra spaces this might create.
    errorMessage = errorMessage.replace(/<\//g, ' </')
  
    const $ = cheerio.load(errorMessage)
    let text = $('div.cl-errorpanel').text().trim().replace(/\\"/g, '"').replace(/  |\\n/g, ' ')
    console.log(`Error Message:\n${text}<===\n`)
    return text
  }

  console.log(`GetTriageDetailsAboutTestFailure - start`)
  return await apiData.Get(log.url).then(data => {
    try {
      fullLogText = data
      // console.log(fullLogText)
      // console.log()

      failureMessage = GetFailureMessage()
      errorPanelText = GetErrorPanelText()

      let returnValue = {
        message: failureMessage, 
        errorPanelText: errorPanelText,
      }
  
      for(let i = 0; i < triageData.length; i++) {
        console.log(`GetTriageDetailsAboutTestFailure - for i=${i}`)
        // testName is an "AND" condition with the other query conditions.
        if (triageData[i].testName) {
          if (!log.key.includes(triageData[i].testName)) {
            console.log(`GetTriageDetailsAboutTestFailure - 'testName' - continue not a match`)
            continue // because this one is not a match
          }
        }

        if (query(triageData[i])) {
          returnValue.knownIssue = true
          returnValue.bugs = triageData[i].bugs
          returnValue.comment = triageData[i].comment
          break
        }
      }
      console.log(`GetTriageDetailsAboutTestFailure returns:`)
      console.log(returnValue)
      return returnValue
    }
    catch(error) {
      console.log(`!!! ERROR: ${error.message}`)
    }
  })
}

// UNIT TESTS - These are triggered ONLY when running this as a standalone module.
if (require.main === module) {
  (async function () {
    const triageData = [
      {
        testName: 'Regression-Log',
        and: [
          `Timed out retrying: Expected to find content:`,
          `within the element: <div.wc-message-content> but never did.`,
        ],
        bugs: [2197]
      },
      {
        and: [
          `cy.visit() failed trying to load:`,
          `http://localhost:3000/`
        ],
        comment: 'This happens from time to time and there is no known fix for it.',
      },
      {
        and: [`Expected to find element:`, `but never found it.`, 'No WAY!'],
        comment: 'This should NEVER be the answer',
      },
      { // Should be a match
        and: [
          `Expected to find element:`, 
          `but never found it.`,
          {
            searchBy: FULL_LOG,
            or: [
              `This will NOT be found`,
              { 
                and : [
                `Should import a model to test against and navigate to Train Dialogs view`,
                { 
                  searchBy: ERROR_PANEL,
                  and: [`Creating Application Failed Request failed with status code 400 "Bad Request {"Locale":["The Locale field is required."]}`],
                },
              ]},
            ],
          },
        ],
        comment: 'This can be the answer',
      },
      { // Should be a match
        searchBy: ERROR_PANEL,
        and: [`Creating Application Failed Request failed with status code 400 "Bad Request {"Locale":["The Locale field is required."]}"`],
        comment: 'This is the correct answer'
      }
    ]
   
    SetTriageData(triageData)

    await GetTriageDetailsAboutTestFailure({
      key: 'WeDoNotNeedToMatchThis',
      url: 'https://5509-94457606-gh.circle-artifacts.com/0/root/project/results/cypress/Regression-EditAndBranching-LastTurnUndo.spec.js.19.12.13.01.21.57..846.log'})
  }())
}