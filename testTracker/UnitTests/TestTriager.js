const ttf = require('../TriageTestFailure');
//import * as ttf from '../TriageTestFailure'

(async function () {
  const FAILURE_MESSAGE = 'fm'
  const ERROR_PANEL = 'ep'
  const FULL_LOG = 'fl'
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
      and: [`Creating Application Failed Request failed with status code 400 "Bad Request {"Locale":["The Locale field is required."]}`],
      comment: 'This is the correct answer'
    }
  ]

  ttf.SetTriageData(triageData)

  ttf.GetTriageDetailsAboutTestFailure({
    key: 'weDoNotNeedToMatchThis',
    url: 'https://5509-94457606-gh.circle-artifacts.com/0/root/project/results/cypress/Regression-EditAndBranching-LastTurnUndo.spec.js.19.12.13.01.21.57..846.log'})
}())
