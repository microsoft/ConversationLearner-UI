const axios = require('axios')
const cheerio = require('cheerio')

const FAILURE_MESSAGE = 'fm'
const ERROR_PANEL = 'ep'
const FULL_LOG = 'fl'

const triageData = [
  {
    //testName: 'Regression-Log',
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
  {
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
            }
          ]}
          
        ],
      },
    ],
    comment: 'This can be the answer',
  },
  {
    searchBy: ERROR_PANEL,
    and: [`Creating Application Failed Request failed with status code 400 "Bad Request {"Locale":["The Locale field is required."]}`],
    comment: 'This is the correct answer'
  }
]

async function GetTriageDetailsAboutTestFailure(log) {
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

  console.log(`GetTriageDetailsAboutTestFailure - start`)
  return await GetApiData(log.url).then(data => {
    try {
      fullLogText = data
      // console.log(fullLogText)
      // console.log()

      const searchForFailureMessage = '\nFailure Message: '
      let index = fullLogText.lastIndexOf(searchForFailureMessage)
      if (index == -1) {
        console.log(`GetTriageDetailsAboutTestFailure - not found error`)
        failureMessage = 'ERROR: Failure Message was not found in this log file.'
      } else {
        failureMessage = fullLogText.substring(index + searchForFailureMessage.length)
      }
      errorPanelText = GetErrorPanelText(fullLogText)
      
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
          returnValue = {
            message: failureMessage, 
            bugs: triageData[i].bugs, 
            comment: triageData[i].comment,
            errorPanelText: errorPanelText,
          }
          console.log(`GetTriageDetailsAboutTestFailure returns:`)
          console.log(returnValue)
          return returnValue
        }
      }
      console.log(`GetTriageDetailsAboutTestFailure returns: ${failureMessage}`)
      return failureMessage
    }
    catch(error) {
      console.log(`!!! ERROR: ${error.message}`)
    }
  })
}

function GetErrorPanelText(logText) {
  const errorPanelMarker = 'Error Panel found in Current HTML'
  const index = logText.indexOf(errorPanelMarker)
  if (index == -1) { return undefined }

  let start = logText.indexOf('\n', index + errorPanelMarker.length) + 6
  let end = logText.indexOf('\n-+- ', start)
  let errorMessage = logText.substring(start, end).trim()

  console.log(`start: ${start} - end: ${end}`)
  console.log('Extracted:\n' + errorMessage + '\n')

  // Adding spaces to the end of each potential text string just to be sure there is a break between words.
  // Later we will remove any extra spaces this might create.
  errorMessage = errorMessage.replace(/<\//g, ' </')

  const $ = cheerio.load(`<div class="cl-errorpanel"><div class="css-52"><span>Creating Application </span> Failed </div><div class="css-53">Request failed with status code 400 </div><p>"Bad Request\n{\"Locale\":[\"The Locale field is required.\"]}" </p> </div>`)
  let text = $('div.cl-errorpanel').text().trim().replace(/  |\n/g, ' ')
  console.log(`Error Message:\n${text}<===\n`)
  return text
}

async function GetApiData(url) {
  return await axios.get(url).then(response => {
    return response.data
  })
  .catch(err => {
    console.log(`GetApiData - Error accessing: ${url}`)
    console.log(err.message)
  })
}

(async function () {
  await GetTriageDetailsAboutTestFailure({
    key: 'neverGonnaMatchThis',
    url: 'https://5509-94457606-gh.circle-artifacts.com/0/root/project/results/cypress/Regression-EditAndBranching-LastTurnUndo.spec.js.19.12.13.01.21.57..846.log'})
}())
