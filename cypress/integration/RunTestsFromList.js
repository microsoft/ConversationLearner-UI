/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

const helpers = require('../support/Helpers')
const testListManager = require('../support/TestListManager')

// ************ MODIFY THIS LIST *****************************************
// This is the list of tests that will be executed when "RunTestsFromList"
// is selected from the Cypress Test GUI.
export const testList =
[
  "Tools.DeleteAllModels",
]

// Do NOT alter this list except to add in new test cases as they are created.
var masterListOfAllTestCases = 
[
  "CreateModels.AllEntityTypes",
  "CreateModels.DisqualifyingEntities",
  "CreateModels.WaitVsNoWaitActions",
  "CreateModels.WhatsYourName",
  "EditAndBranching.VerifyEditTrainingControlsAndLabels",
  "EditAndBranching.Branching",
  "Log.WhatsYourName",
  "Train.DisqualifyingEntities",
  "Train.WaitVsNoWaitActions",
  "Train.WhatsYourName1",
  "Train.WhatsYourName2",
  "Tools.DeleteAllModels",
]

// This will queue up all test cases found in the testList array.
testListManager.AddToCypressTestList(testList) 
