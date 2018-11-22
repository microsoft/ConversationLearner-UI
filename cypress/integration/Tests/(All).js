/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

const testListManager = require('../../support/TestListManager')

// This will queue up all test cases found in the testList array.
testListManager.AddToCypressTestList(require('../RunTestsFromList').masterListOfAllTestCases) 
