const FAILURE_MESSAGE = 'fm'
const ERROR_PANEL = 'ep'
const FULL_LOG = 'fl'

exports.triageData = [
  {
    or: [
      `Timed out retrying: Stauts is queued - Still Waiting for Status == Running or Completed - Queued Wait Time:`,
      `Timed out retrying: Status is queued - Still Waiting for Status == Running or Completed - Queued Wait Time:`,
    ],
    bugs: [2415]
  },
  { 
    and: [`Timed out retrying: Expected to find element: 'button.ms-Dropdown-item[title="Enum"]', but never found it.`],
    bugs: [2409],
  },
  {
    and: [`Bugs 2389 & 2400 - Entity Detection panel shows a phrase that is different than the user's utterance.`],
    bugs: [2389, 2400]
  },
  {
    and: [
      "Timed out retrying: Expected to find content: 'z-rename-",
      "within the element: <div.css-69> but never did.",
    ],
    bugs: [2407],
  },
  {
    or: [`Expected to find content: 'world peace' within the element: [ <span.`],
    bugs: [2416],
  },
  {
    or: [
      `Expected to find element: '[data-testid="fuse-match-option"]', but never found it. Queried from element: <div.editor-container.`,
      `Response: What's your name? - Expected to find data-testid="action-scorer-button-clickable" instead we found "action-scorer-button-no-click"`
    ],
    bugs: [2396],
  },
  {
    testName: 'Settings.spec.js',
    and: [`RETRY - Loaded Model List Row Count does not yet match the aria-rowcount.`],
    bugs: [2418],
  },
  {
    testName: 'MissingAction.spec.js',
    and: [`Timed out retrying: Expected to find element: '[data-testid="action-scorer-button-clickable"]', but never found it. Queried from element: <div.ms-DetailsRow-fields.`],
    bugs: [2419],
  },
  {
    testName: 'Bug2379Repro.spec.js',
    and: [`Timed out retrying: Expected to find element: 'span[role="button"]', but never found it. Queried from element: <span.ms-TagItem-text.>`],
    comment: 'TEST BUG - Its been fixed, should see this working soon.',
  },
  {
    and: [`Chat turn 2 should be an exact match to: The user asks a silly question, however, we found The user asks another question instead`],
    comment: 'UI BUG is fixed - Test code modified to pass, should see this working soon.',
    bugs: [2265]
  },
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
    searchBy: ERROR_PANEL,
    and: [`Creating Application Failed Request failed with status code 400 "Bad Request {"Locale":["The Locale field is required."]}`],
    bugs: [2408],
  },
  {
    searchBy: ERROR_PANEL,
    and: [`Running extractor Failed Request failed with status code 502 "Bad Gateway "LUIS error:`],
    comment: 'Network Issues - It should eventually fix itself.',
  },
  {
    searchBy: FULL_LOG,
    and: [
      `Failure Message: You attempted to select the phrase:`,
      `, but it was not found in the input:`,
    ],
    bugs: [2422],
    comment: 'Bug in Test_SelectWord',
  },
  {
    testName: 'Regression-BugRepro-Bug2319Repro.spec.js',
    and: [`Expected to find 'X' in the text chat pane, instead we found 'ERROR: Missing ConversationReference' at index: 4`],
    bugs: [2319],
  },
  {
    testName: 'Regression-Log-Abandon.spec.js',
    // Using OR since there will probably be other variations on the failure message associated with this bug
    or: [`Timed out retrying: 3 rows found in the training grid, however we were expecting 2`],
    bugs: [2212],
  },
  {
    testName: 'Regression-BugRepro-Bug2119Repro.spec.js',
    searchBy: FULL_LOG,
    // Using OR since there will probably be other variations on the failure message associated with this bug
    or: [`TextContentWithoutNewlines - Raw Text Content: "User utterance **#**6"`],
    bugs: [2423],
    comment: 'PLEASE UPDATE BUG REPORT with a count on any instances of this bug that you find.',
  },
  {
    testName: 'Regression-Train-ApiMemoryManipulation.spec.js',
    and: [
      `Expected to find element: '[data-testid="action-scorer-button-clickable"]', but never found it. Queried from element: <div.ms-DetailsRow-fields`,
      {
        searchBy: FULL_LOG,
        and: [`FAILED - Test Case: 'API Memory Manipulation - Train - Train - Should remove one of the toppings and verify the resulting list is correct'`],
      }
    ],
    bugs: [2416],
    comment: 'Another instance of that LUIS bug that mislabels Entities.',
  }
]

// NOT USED BY THE CODE - AN EXAMPLE ONLY
exampleTriageData = [
  { // This is a complex example that shows how to search different strings found in the test artifacts.
    // 
    and: [
      `Expected to find element:`,  // must be in the Failure Message
      `but never found it.`,        // and this must also be in the Failure Message
      {                             // and this entire block must result in TRUE
        searchBy: FULL_LOG,         // Search will now occur in the FULL_LOG
        or: [
          `This will NOT be found`, // Since we are now in an OR this one can be FALSE if the other is TRUE
          {                         // Starting a new block that is ORed with the prior test
            and : [                 
              `Should import a model to test against and navigate to Train Dialogs view`, // this should also be found in the FULL_LOG
              {                       // Starting a new block that is ANDed with the prior test
                searchBy: ERROR_PANEL,// Search will now occur in the ERROR_PANEL
                and: [`Creating Application Failed Request failed with status code 400 "Bad Request {"Locale":["The Locale field is required."]}`],
              },
            ]
          },
        ],
      },
    ],
    comment: 'This is a complex query example',
  },
]